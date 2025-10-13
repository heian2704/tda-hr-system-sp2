import { AppStatus } from "@/constants/application-status.enum";

export interface UpdateApplicationDto {
  name?: string;
  phoneNumber?: string;
  address?: string;
  information?: string;
  position?: string;
  status?: AppStatus;
  date?: Date;
}

export interface UpdateApplicationStatusDto {
    status: string
}
