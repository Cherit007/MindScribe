import { database } from "@/appwriteConfig";
import { currentProfile } from "@/lib/current-profile";
import { ID, Query } from "appwrite";
import axios from "axios";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  let retries = 3;
  while (retries > 0) {
    try {
      const user = await currentProfile();
      if (!user) return new NextResponse("User not found", { status: 401 });
      const userDetails = await req.json();
      const articleId = uuidv4();
      const imgUrl =
        userDetails?.articleImgUrl?.$id ?? userDetails?.articleImgUrl;
      await database.createDocument(
        "651d2c31d4f6223e24e2",
        "651d2c5fca0e679e84a7",
        articleId,
        {
          title: userDetails?.title,
          description: userDetails?.description,
          authorId: user?.userId,
          topic: userDetails?.topic,
          articleImgUrl: imgUrl,
          users: user.$id,
        }
      );

      const article = database.listDocuments(
        "651d2c31d4f6223e24e2",
        "651d2c5fca0e679e84a7",
        [Query.equal("authorId", user?.userId)]
      );
      const {
        NEXT_PUBLIC_MAIL_SERVICE_API_URL,
        NEXT_PUBLIC_RECOMMENDATIONS_API_URL,
        NEXT_PUBLIC_SEARCH_ENGINE_API_URL,
      } = process.env;

      const payload = {
        recipient_email: user?.email,
        subject: `${user?.name}, you have successfully published your article.`,
        message: "Feel free to review and make changes to your article.",
      };

      await axios.post(`${NEXT_PUBLIC_MAIL_SERVICE_API_URL}/send-ack`, payload);

      await axios.post(
        `${NEXT_PUBLIC_SEARCH_ENGINE_API_URL}/add-article-elastic-search`,
        {
          title: userDetails?.title,
          article_id: articleId,
        }
      );
      await axios.post(
        `${NEXT_PUBLIC_RECOMMENDATIONS_API_URL}/add-to-recommendations`,
        {
          article_name_to_add: userDetails?.title,
        }
      );

      return NextResponse.json({ data: article });
    } catch (e) {
      retries--;
      console.log("AUTH FAILED", e);
      if (retries == 0)
        return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
}
