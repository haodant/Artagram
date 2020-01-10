import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  // posts = [
  //   { title: "tittle1", content: "title1's content" },
  //   { title: "tittle2", content: "title2's content" },
  // ]
  @Input() posts=[];
  constructor() { }

  ngOnInit() {
  }

}
