"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";

import type { SiteContent } from "@/data/site-content";

type Props = {
  initialContent: SiteContent;
};

export function ContentDashboard({ initialContent }: Props) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateLeader(index: number, field: keyof SiteContent["leaders"][number], value: string) {
    setContent((current) => ({
      ...current,
      leaders: current.leaders.map((leader, leaderIndex) =>
        leaderIndex === index ? { ...leader, [field]: value } : leader,
      ),
    }));
  }

  function updateCabinetMember(index: number, field: keyof SiteContent["cabinetMembers"][number], value: string) {
    setContent((current) => ({
      ...current,
      cabinetMembers: current.cabinetMembers.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    }));
  }

  function updateNews(index: number, field: keyof SiteContent["latestNews"][number], value: string) {
    setContent((current) => ({
      ...current,
      latestNews: current.latestNews.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function updateActivity(index: number, field: keyof SiteContent["activities"][number], value: string | string[]) {
    setContent((current) => ({
      ...current,
      activities: current.activities.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function parseLines(value: string) {
    return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }

  async function saveContent() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save content.");
      }

      setContent(payload.content);
      setMessage("Content updated successfully. Refresh the public pages to review the new version.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save content.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>, target: { type: "leader" | "activity" | "cabinet"; index: number; imageIndex?: number }) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingKey(`${target.type}-${target.index}-${target.imageIndex ?? 0}`);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/content/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Image upload failed.");
      }

      if (target.type === "leader") {
        updateLeader(target.index, "photoUrl", payload.url);
      } else if (target.type === "cabinet") {
        updateCabinetMember(target.index, "photoUrl", payload.url);
      } else {
        setContent((current) => ({
          ...current,
          activities: current.activities.map((activity, activityIndex) => {
            if (activityIndex !== target.index) {
              return activity;
            }

            const nextImages = [...activity.images];
            nextImages[target.imageIndex || 0] = payload.url;
            return { ...activity, images: nextImages };
          }),
        }));
      }

      setMessage("Image uploaded. Remember to click Save content.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploadingKey(null);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-8 rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">Admin Content</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-brand-ink">Update the public website without code</h2>
          <p className="mt-2 max-w-2xl text-brand-ink/70">You can edit the homepage text, member names, member photos, activities, ministers, vice ministers, and news here. Upload an image, save, then refresh the public pages.</p>
        </div>
        <button type="button" onClick={saveContent} disabled={saving} className="rounded-full bg-brand-red px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-70">
          {saving ? "Saving..." : "Save content"}
        </button>
      </div>

      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-4 rounded-[1.75rem] border border-brand-ink/10 bg-brand-cloud/50 p-5">
        <h3 className="font-display text-xl font-bold text-brand-ink">Homepage text</h3>
        <label className="grid gap-2"><span className="text-sm font-semibold">Hero title</span><input value={content.heroTitle} onChange={(e) => updateField("heroTitle", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3" /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold">Hero subtitle</span><input value={content.heroSubtitle} onChange={(e) => updateField("heroSubtitle", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3" /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold">Welcome text</span><textarea value={content.welcomeText} onChange={(e) => updateField("welcomeText", e.target.value)} rows={4} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3" /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold">Mission statement</span><textarea value={content.missionStatement} onChange={(e) => updateField("missionStatement", e.target.value)} rows={6} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3" /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold">Current mandate</span><input value={content.currentMandate} onChange={(e) => updateField("currentMandate", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3" /></label>
      </section>

      <section className="grid gap-4 rounded-[1.75rem] border border-brand-ink/10 bg-brand-cloud/50 p-5">
        <h3 className="font-display text-xl font-bold text-brand-ink">Goals and accomplishments</h3>
        <label className="grid gap-2"><span className="text-sm font-semibold">Goals (one per line)</span><textarea value={content.goals.join("\n")} onChange={(e) => updateField("goals", parseLines(e.target.value))} rows={4} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3" /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold">Accomplishments (one per line)</span><textarea value={content.accomplishments.join("\n")} onChange={(e) => updateField("accomplishments", parseLines(e.target.value))} rows={4} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3" /></label>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-brand-ink/10 bg-brand-cloud/50 p-5">
        <h3 className="font-display text-xl font-bold text-brand-ink">Members and yearly leadership</h3>
        {content.leaders.map((leader, index) => (
          <div key={`${leader.role}-${index}`} className="grid gap-4 rounded-[1.5rem] border border-brand-ink/10 bg-white p-4 lg:grid-cols-[180px_1fr]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-[1.5rem] border border-brand-ink/10 bg-brand-cloud">
                {leader.photoUrl ? <Image src={leader.photoUrl} alt={leader.name} width={180} height={180} className="h-[180px] w-full object-cover" unoptimized /> : <div className="flex h-[180px] items-center justify-center text-sm text-brand-ink/55">No photo yet</div>}
              </div>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleImageUpload(e, { type: "leader", index })} className="text-sm" />
              <p className="text-xs text-brand-ink/55">{uploadingKey === `leader-${index}-0` ? "Uploading image..." : "Upload leader photo"}</p>
            </div>
            <div className="grid gap-3">
              <label className="grid gap-2"><span className="text-sm font-semibold">Role</span><input value={leader.role} onChange={(e) => updateLeader(index, "role", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
              <label className="grid gap-2"><span className="text-sm font-semibold">Name</span><input value={leader.name} onChange={(e) => updateLeader(index, "name", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
              <label className="grid gap-2"><span className="text-sm font-semibold">Bio</span><textarea value={leader.bio} onChange={(e) => updateLeader(index, "bio", e.target.value)} rows={4} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-brand-ink/10 bg-brand-cloud/50 p-5">
        <h3 className="font-display text-xl font-bold text-brand-ink">Ministers and vice ministers</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {content.cabinetMembers.map((member, index) => (
            <div key={`${member.role}-${index}`} className="grid gap-4 rounded-[1.5rem] border border-brand-ink/10 bg-white p-4 sm:grid-cols-[140px_1fr]">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-[1.25rem] border border-brand-ink/10 bg-brand-cloud">
                  {member.photoUrl ? <Image src={member.photoUrl} alt={member.name} width={140} height={140} className="h-[140px] w-full object-cover" unoptimized /> : <div className="flex h-[140px] items-center justify-center text-sm text-brand-ink/55">No photo yet</div>}
                </div>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleImageUpload(e, { type: "cabinet", index })} className="text-sm" />
                <p className="text-xs text-brand-ink/55">{uploadingKey === `cabinet-${index}-0` ? "Uploading image..." : "Upload member photo"}</p>
              </div>
              <div className="grid gap-3">
                <label className="grid gap-2"><span className="text-sm font-semibold">Role</span><input value={member.role} onChange={(e) => updateCabinetMember(index, "role", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
                <label className="grid gap-2"><span className="text-sm font-semibold">Name</span><input value={member.name} onChange={(e) => updateCabinetMember(index, "name", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-brand-ink/10 bg-brand-cloud/50 p-5">
        <h3 className="font-display text-xl font-bold text-brand-ink">Activities</h3>
        {content.activities.map((activity, activityIndex) => (
          <div key={`${activity.title}-${activityIndex}`} className="space-y-4 rounded-[1.5rem] border border-brand-ink/10 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2"><span className="text-sm font-semibold">Activity title</span><input value={activity.title} onChange={(e) => updateActivity(activityIndex, "title", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
              <label className="grid gap-2"><span className="text-sm font-semibold">Date / caption</span><input value={activity.date} onChange={(e) => updateActivity(activityIndex, "date", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
            </div>
            <label className="grid gap-2"><span className="text-sm font-semibold">Description</span><textarea value={activity.description} onChange={(e) => updateActivity(activityIndex, "description", e.target.value)} rows={4} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
            <div className="grid gap-3 lg:grid-cols-3">
              {activity.images.map((image, imageIndex) => (
                <div key={`${activity.title}-image-${imageIndex}`} className="space-y-3 rounded-[1.25rem] border border-brand-ink/10 bg-brand-cloud p-3">
                  <div className="overflow-hidden rounded-[1rem] bg-white">
                    {image ? <Image src={image} alt={`${activity.title} ${imageIndex + 1}`} width={220} height={140} className="h-[140px] w-full object-cover" unoptimized /> : <div className="flex h-[140px] items-center justify-center text-sm text-brand-ink/55">No image</div>}
                  </div>
                  <input value={image} onChange={(e) => {
                    const nextImages = [...activity.images];
                    nextImages[imageIndex] = e.target.value;
                    updateActivity(activityIndex, "images", nextImages);
                  }} className="rounded-2xl border border-brand-ink/10 bg-white px-3 py-2 text-sm" placeholder="Image URL" />
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleImageUpload(e, { type: "activity", index: activityIndex, imageIndex })} className="text-sm" />
                  <p className="text-xs text-brand-ink/55">{uploadingKey === `activity-${activityIndex}-${imageIndex}` ? "Uploading image..." : "Upload activity photo"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-brand-ink/10 bg-brand-cloud/50 p-5">
        <h3 className="font-display text-xl font-bold text-brand-ink">Latest News</h3>
        {content.latestNews.map((item, index) => (
          <div key={`${item.title}-${index}`} className="grid gap-3 rounded-[1.5rem] border border-brand-ink/10 bg-white p-4">
            <label className="grid gap-2"><span className="text-sm font-semibold">Title</span><input value={item.title} onChange={(e) => updateNews(index, "title", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
            <label className="grid gap-2"><span className="text-sm font-semibold">Date</span><input value={item.date} onChange={(e) => updateNews(index, "date", e.target.value)} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
            <label className="grid gap-2"><span className="text-sm font-semibold">Summary</span><textarea value={item.summary} onChange={(e) => updateNews(index, "summary", e.target.value)} rows={4} className="rounded-2xl border border-brand-ink/10 bg-brand-cloud px-4 py-3" /></label>
          </div>
        ))}
      </section>
    </div>
  );
}
