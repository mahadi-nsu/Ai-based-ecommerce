import { SetMetadata } from "@nestjs/common";

export const SKIP_API_RESPONSE_WRAP = Symbol("SKIP_API_RESPONSE_WRAP");

export const SkipApiResponseWrap = () => SetMetadata(SKIP_API_RESPONSE_WRAP, true);
