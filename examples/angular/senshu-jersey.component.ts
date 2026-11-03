import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-senshu-jersey",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<senshu-jersey [attr.cut]="cut" [attr.colors]="colors" [attr.number]="number"></senshu-jersey>`,
})
export class SenshuJerseyComponent implements OnInit {
  @Input() cut = "hockey";
  @Input() colors = "#af1e2d,#ffffff,#192168";
  @Input() number = 9;

  ngOnInit(): void {
    // The element needs a browser: ngOnInit also runs when a server renders, so the import waits for one.
    if (typeof window !== "undefined") void import("@johnmorrisdotca/senshu-jerseys/define");
  }
}
