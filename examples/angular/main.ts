import "@angular/compiler";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { SenshuJerseyComponent } from "./senshu-jersey.component";

void bootstrapApplication(SenshuJerseyComponent, { providers: [provideZonelessChangeDetection()] });
