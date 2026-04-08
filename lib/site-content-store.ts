import { defaultSiteContent, type SiteContent } from "@/data/site-content";
import { getDatabase } from "@/lib/db";
import { canUseLocalFallback } from "@/lib/env";
import { getLocalContent, upsertLocalContent } from "@/lib/local-store";

const CONTENT_DOCUMENT_ID = "public-site-content";

type StoredContentDocument = SiteContent & {
  _id: string;
  updatedAt: Date | string;
};

function normalizeContent(content?: Partial<SiteContent> | null): SiteContent {
  return {
    ...defaultSiteContent,
    ...content,
    goals: content?.goals?.length ? content.goals : defaultSiteContent.goals,
    accomplishments: content?.accomplishments?.length ? content.accomplishments : defaultSiteContent.accomplishments,
    latestNews: content?.latestNews?.length ? content.latestNews : defaultSiteContent.latestNews,
    activities: content?.activities?.length ? content.activities : defaultSiteContent.activities,
    leaders: content?.leaders?.length ? content.leaders : defaultSiteContent.leaders,
    teams: content?.teams?.length ? content.teams : defaultSiteContent.teams,
    cabinetMembers: content?.cabinetMembers?.length ? content.cabinetMembers : defaultSiteContent.cabinetMembers,
  };
}

async function getMongoCollection() {
  const db = await getDatabase();
  return db.collection<StoredContentDocument>("siteContent");
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const collection = await getMongoCollection();
    const document = await collection.findOne({ _id: CONTENT_DOCUMENT_ID });
    return normalizeContent(document);
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    const localContent = await getLocalContent();
    return normalizeContent(localContent);
  }
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const normalized = normalizeContent(content);

  try {
    const collection = await getMongoCollection();
    await collection.updateOne(
      { _id: CONTENT_DOCUMENT_ID },
      {
        $set: {
          ...normalized,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    await upsertLocalContent(normalized);
    return normalized;
  }

  return normalized;
}
