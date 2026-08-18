import { API_BASE_URL } from "@/constants/config";
import { apiRequest } from "@/lib/api-client";
import type { Application, ApplicationResponse } from "@/types/api";

const MOCK_APPLICATION: Application = {
  id: 1,
  app_title: "365 မောင်း",
  football_rules: "",
  interface_content: "Minimum bet 500 Kyat, Maximum 20,000 Kyat ✦ ",
  is_esports_open: true,
  is_fight_open: true,
  updated_at: new Date().toISOString(),
};

export async function fetchApplication(): Promise<Application> {
  if (!API_BASE_URL) {
    return MOCK_APPLICATION;
  }
  const data = await apiRequest<ApplicationResponse>("/application");
  return data.application;
}
