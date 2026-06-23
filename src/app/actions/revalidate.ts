"use server";

import { revalidateTag } from "next/cache";

export async function revalidateFeed() {
  revalidateTag("feed", "max");
}

export async function revalidateDirectory() {
  revalidateTag("directory", "max");
}

export async function revalidateProfiles() {
  revalidateTag("profiles", "max");
}

export async function revalidateAll() {
  revalidateTag("feed", "max");
  revalidateTag("directory", "max");
  revalidateTag("profiles", "max");
}
