import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TimelineComponent } from './timeline/timeline.component';
import { TimelineItemComponent } from './timeline/timeline.component';
import { TimelineTimeComponent } from './timeline/timeline.component';
import { AccordionListComponent } from './accordion-list/accordion-list.component';

@NgModule({
  declarations: [
    TimelineComponent,
    TimelineItemComponent,
    TimelineTimeComponent,
    AccordionListComponent
  ],
  exports: [
    TimelineComponent,
    TimelineItemComponent,
    TimelineTimeComponent,
    AccordionListComponent
  ],
  imports: [
    IonicModule
  ]
})
export class ComponentsModule {}