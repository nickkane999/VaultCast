import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/lib/server/mongodb";
import { ObjectId, Collection, Document } from "mongodb";

const DEFAULT_TEMPLATES = [
  {
    id: "marketing-modern",
    name: "Modern Marketing",
    category: "marketing",
    thumbnail: "/api/ai_emailer/designs/thumbnails/marketing-modern.png",
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "newsletter-clean",
    name: "Clean Newsletter",
    category: "newsletter",
    thumbnail: "/api/ai_emailer/designs/thumbnails/newsletter-clean.png",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, serif; background-color: #ffffff;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff;">
                    <tr>
                        <td style="border-bottom: 3px solid {{primaryColor}}; padding: 30px 20px; text-align: center;">
                            {{#if logoUrl}}<img src="{{logoUrl}}" alt="Logo" style="max-width: 120px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">{{/if}}
                            <h1 style="color: #333; margin: 0; font-size: 32px; font-weight: 400; font-family: Georgia, serif;">{{title}}</h1>
                            <div style="color: #666; font-size: 14px; margin-top: 10px; font-family: Georgia, serif;">{{subtitle}}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 30px;">
                                        <div style="font-size: 16px; line-height: 1.7; color: #444; margin-bottom: 15px; font-family: Georgia, serif;">{{content}}</div>
                                        {{#if buttonText}}<a href="{{buttonUrl}}" style="color: {{primaryColor}}; text-decoration: none; font-weight: 600; font-family: Georgia, serif;">{{buttonText}} →</a>{{/if}}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 25px; text-align: center; color: #666; font-size: 13px; font-family: Georgia, serif;">
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
      title: "Weekly Newsletter",
      subtitle: "Issue #42 - December 2024",
      content: "This week we're covering the latest trends in technology, upcoming events, and insights from our community. Stay informed with our curated selection of articles and updates.",
      buttonText: "Read Full Article",
      buttonUrl: "https://example.com/article",
      footerText: "You're receiving this because you subscribed to our newsletter. Unsubscribe anytime.",
      logoUrl: "",
      primaryColor: "#2563eb",
      secondaryColor: "#1e40af",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "promotional-vibrant",
    name: "Vibrant Promotion",
    category: "promotional",
    thumbnail: "/api/ai_emailer/designs/thumbnails/promotional-vibrant.png",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}}); padding: 50px 20px; text-align: center; position: relative;">
                            {{#if logoUrl}}<img src="{{logoUrl}}" alt="Logo" style="max-width: 140px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">{{/if}}
                            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); font-family: Arial, sans-serif;">{{title}}</h1>
                            <div style="background-color: #ff4757; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-top: 15px; display: inline-block; font-family: Arial, sans-serif;">LIMITED TIME</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 50px 30px; text-align: center;">
                            {{#if subtitle}}<h2 style="font-size: 24px; color: #333; margin: 0 0 20px 0; font-weight: 700; font-family: Arial, sans-serif;">{{subtitle}}</h2>{{/if}}
                            <div style="font-size: 18px; line-height: 1.6; color: #555; margin-bottom: 40px; font-family: Arial, sans-serif;">{{content}}</div>
                            {{#if buttonText}}<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 50px; background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}}); box-shadow: 0 8px 25px rgba(0,0,0,0.2);">
                                        <a href="{{buttonUrl}}" style="display: inline-block; color: #ffffff; padding: 20px 40px; text-decoration: none; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">{{buttonText}}</a>
                                    </td>
                                </tr>
                            </table>{{/if}}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #2c3e50; color: #ecf0f1; padding: 30px; text-align: center; font-size: 14px; font-family: Arial, sans-serif;">
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
      title: "MEGA SALE!",
      subtitle: "Up to 70% Off Everything",
      content: "Don't miss out on our biggest sale of the year! Premium products at unbeatable prices. Limited time offer - grab yours before they're gone!",
      buttonText: "Shop Now",
      buttonUrl: "https://example.com/sale",
      footerText: "Offer valid until December 31st. Terms and conditions apply.",
      logoUrl: "",
      primaryColor: "#e74c3c",
      secondaryColor: "#f39c12",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "announcement-elegant",
    name: "Elegant Announcement",
    category: "announcement",
    thumbnail: "/api/ai_emailer/designs/thumbnails/announcement-elegant.png",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Times New Roman', serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 4px;">
                    <tr>
                        <td style="background-color: {{primaryColor}}; padding: 60px 40px; text-align: center; position: relative;">
                            {{#if logoUrl}}<img src="{{logoUrl}}" alt="Logo" style="max-width: 100px; height: auto; margin-bottom: 25px; display: block; margin-left: auto; margin-right: auto;">{{/if}}
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 2px; font-family: 'Times New Roman', serif;">{{title}}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0; margin: 0; line-height: 0;">
                            <div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid {{primaryColor}}; margin: 0 auto;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 60px 40px; text-align: center;">
                            <div style="font-size: 24px; color: {{primaryColor}}; margin: 20px 0; font-family: 'Times New Roman', serif;">❦</div>
                            {{#if subtitle}}<h2 style="font-size: 22px; color: #333; margin: 0 0 30px 0; font-weight: 300; font-style: italic; font-family: 'Times New Roman', serif;">{{subtitle}}</h2>{{/if}}
                            <div style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 40px; text-align: left; font-family: 'Times New Roman', serif;">{{content}}</div>
                            {{#if buttonText}}<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="border: 2px solid {{primaryColor}}; padding: 15px 35px;">
                                        <a href="{{buttonUrl}}" style="color: {{primaryColor}}; text-decoration: none; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Times New Roman', serif;">{{buttonText}}</a>
                                    </td>
                                </tr>
                            </table>{{/if}}
                            <div style="margin-top: 40px; font-style: italic; color: #666; font-family: 'Times New Roman', serif;">With warm regards,<br>The Team</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 25px 40px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; font-family: 'Times New Roman', serif;">
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
      title: "Important Announcement",
      subtitle: "We have exciting news to share",
      content: "We are delighted to announce a significant milestone in our journey. This achievement represents our commitment to excellence and our dedication to serving you better. We look forward to continuing this journey together.",
      buttonText: "Learn More",
      buttonUrl: "https://example.com/announcement",
      footerText: "This is an official communication from our organization.",
      logoUrl: "",
      primaryColor: "#2c3e50",
      secondaryColor: "#34495e",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "templates") {
      return NextResponse.json({ templates: DEFAULT_TEMPLATES });
    }

    if (type === "designs") {
      const collection = await getCollection("email_designs");
      const designs = await collection.find({}).toArray();

      const transformedDesigns = designs.map((design) => ({
        ...design,
        id: design._id.toString(),
        _id: undefined,
      }));

      return NextResponse.json({ designs: transformedDesigns });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("Error in designs GET:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, templateId, customizations } = body;

    if (type === "design") {
      const collection = await getCollection("email_designs");

      const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }

      const htmlContent = processTemplate(template.htmlContent, customizations);

      const newDesign = {
        name,
        templateId,
        customizations,
        htmlContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newDesign);
      const savedDesign = {
        ...newDesign,
        id: result.insertedId.toString(),
      };

      return NextResponse.json({ design: savedDesign }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error in designs POST:", error);
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }
}
