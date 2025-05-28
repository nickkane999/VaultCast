import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId } from "mongodb";

const DEFAULT_TEMPLATES = [
  {
    id: "marketing-modern",
    name: "Modern Marketing",
    category: "marketing",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); padding: 40px 20px; text-align: center;">
                            {{#if logoUrl}}<img src="{{logoUrl}}" alt="Logo" style="max-width: 150px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">{{/if}}
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; font-family: Arial, sans-serif;">{{title}}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            {{#if subtitle}}<h2 style="font-size: 20px; color: #333; margin: 0 0 20px 0; font-weight: 600; font-family: Arial, sans-serif;">{{subtitle}}</h2>{{/if}}
                            <div style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 30px; font-family: Arial, sans-serif;">{{content}}</div>
                            {{#if buttonText}}<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
                                <tr>
                                    <td style="border-radius: 8px; background-color: {{primaryColor}};">
                                        <a href="{{buttonUrl}}" style="display: inline-block; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: 600; font-size: 16px; font-family: Arial, sans-serif;">{{buttonText}}</a>
                                    </td>
                                </tr>
                            </table>{{/if}}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; font-family: Arial, sans-serif;">
                            {{footerText}}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
    customizableFields: {
      title: "Welcome to Our Amazing Product!",
      subtitle: "Discover what makes us special",
      content: "We're excited to share our latest innovations with you. Our team has been working hard to bring you the best experience possible.",
      buttonText: "Get Started",
      buttonUrl: "https://example.com",
      footerText: "© 2024 Your Company. All rights reserved.",
      logoUrl: "",
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
    },
  },
];

function processTemplate(htmlContent: string, customizations: any): string {
  let processed = htmlContent;

  Object.entries(customizations).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    processed = processed.replace(regex, (value as string) || "");
  });

  const conditionalRegex = new RegExp("{{#if (\\w+)}}([\\s\\S]*?){{/if}}", "g");
  processed = processed.replace(conditionalRegex, (match, field, content) => {
    return customizations[field] ? content : "";
  });

  return processed;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { customizations } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });
    }

    const collection = await getCollection("email_designs");

    const existingDesign = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingDesign) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const template = DEFAULT_TEMPLATES.find((t) => t.id === existingDesign.templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const htmlContent = processTemplate(template.htmlContent, customizations);

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          customizations,
          htmlContent,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const updatedDesign = await collection.findOne({ _id: new ObjectId(id) });
    if (!updatedDesign) {
      return NextResponse.json({ error: "Design not found after update" }, { status: 500 });
    }

    const transformedDesign = {
      ...updatedDesign,
      id: updatedDesign._id.toString(),
      _id: undefined,
    };

    return NextResponse.json({ design: transformedDesign });
  } catch (error) {
    console.error("Error updating design:", error);
    return NextResponse.json({ error: "Failed to update design" }, { status: 500 });
  }
}
