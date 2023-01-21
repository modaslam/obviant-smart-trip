import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  @Input('endIcon') endIcon = "ionic";

  constructor() { }

  ngOnInit() {
  }

}

@Component({
  selector: 'timeline-item',
  template: '<ng-content></ng-content>'
})
export class TimelineItemComponent{
  constructor(){

  }
}


@Component({
  selector:'timeline-time',
  template: '<span>{{leg.distance.text}}</span> <span>{{leg.duration.text}}</span>'
})
export class TimelineTimeComponent{
  @Input('leg') leg = {};
  constructor(){
    console.log("Working");
  }
}

