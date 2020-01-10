import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ignite';
  posts=[];
  onPostAdded(post) {
    // this.posts = [...this.posts, post];
    this.posts.push(post);
  }
}
