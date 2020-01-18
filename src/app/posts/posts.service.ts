import { Post } from "./post.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  private postUrl = "http://localhost:3000/api/posts/";

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(this.postUrl)
      .pipe(
        map(postData => {
          return postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath
            };
          });
        })
      )
      .subscribe(posts => {
        this.posts = posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(
      this.postUrl + id
    );
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
      let postData: Post | FormData;
      if (typeof image === 'object') {
        postData = new FormData();
        postData.append('id', id);
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);
      } else {
        postData = {
            id: id,
            title: title,
            content: content,
            imagePath: image
          };
      }
    this.http.put(this.postUrl + id, postData)
      .subscribe(response => {
      const updatePosts = [...this.posts];
      const oldPostIndex = updatePosts.findIndex(p => p.id === id);
      const post: Post = {
        id: id,
        title: title,
        content: content,
        imagePath: ""//response.imagePath
      };
      updatePosts[oldPostIndex] = post;
      this.posts = updatePosts;
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    });
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http
      .post<{ message: string; post: Post }>(this.postUrl, postData)
      .subscribe(responseData => {
        const post: Post = {
          id: responseData.post.id,
          title: title,
          content: content,
          imagePath: responseData.post.imagePath
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    this.http.delete(this.postUrl + postId).subscribe(() => {
      const updatedPosts = this.posts.filter(post => post.id != postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    });
  }
}