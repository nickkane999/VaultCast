import { NextResponse } from "next/server";
import { generateEmailWithDesign } from "@/lib/server/chatgpt";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId, WithId, Document } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailTitle, question, requestType, selectedDesignId, customizations, templateId } = body;

    let designContext = undefined;
    let selectedDesign: WithId<Document> | null = null;
    let actualTemplateId = templateId;

    // If a design is selected, fetch it and create context
    if (selectedDesignId) {
      const collection = await getCollection("email_designs");
      selectedDesign = await collection.findOne({ _id: new ObjectId(selectedDesignId) });

      if (selectedDesign) {
        actualTemplateId = (selectedDesign as any)?.templateId;
      }
    }

    // Get template info for design context
    if (actualTemplateId) {
      const templatesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000"}/api/ai_emailer/designs?type=templates`);
      const templatesData = await templatesResponse.json();
      const template = templatesData.templates.find((t: any) => t.id === actualTemplateId);

      if (template) {
        designContext = {
          templateName: template.name,
          category: template.category,
          availableFields: Object.keys(template.customizableFields),
        };
      }
    }

    // Generate the email content
    const aiResponse = await generateEmailWithDesign({
      emailTitle,
      question,
      designContext,
      customizations,
      requestType,
    });

    // If we have design context and the response is JSON, parse and apply to template
    if (designContext && requestType === "Raw HTML" && actualTemplateId) {
      try {
        const parsedResponse = JSON.parse(aiResponse);

        // Merge with existing customizations
        const finalCustomizations = { ...customizations, ...parsedResponse };

        // Generate the final HTML using the template
        const previewResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000"}/api/ai_emailer/designs/preview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateId: actualTemplateId,
            customizations: finalCustomizations,
          }),
        });

        if (previewResponse.ok) {
          const previewData = await previewResponse.json();
          return NextResponse.json({
            response: previewData.html,
            customizations: finalCustomizations,
            isDesignBased: true,
          });
        }
      } catch (parseError) {
        console.log("Response wasn't JSON, treating as regular content");
      }
    }

    return NextResponse.json({
      response: aiResponse,
      isDesignBased: false,
    });
  } catch (error: any) {
    console.error("Error generating email with design:", error);
    return NextResponse.json({ error: error.message || "Error generating email" }, { status: 500 });
  }
}
