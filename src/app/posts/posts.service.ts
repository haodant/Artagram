import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts() {
        this.http.get<{ message: string, posts: any }>(
            "http://localhost:3000/api/posts"
            )
            .pipe(map(postData => {
                return postData.posts.map(post => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id
                    }
                })
            }))
            .subscribe((posts) => {
                this.posts = posts;
                this.postsUpdated.next([...this.posts]);
            })
    }

    getPostUpdatedListener() {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string) {
        return this.http.get<{_id: string, title: string, content: string}>('http://localhost:3000/api/posts/' + id);
    }

    updatePost(id: string, title: string, content: string) {
        const post: Post = {id: id, title: title, content: content};
        this.http.put('http://localhost:3000/api/posts/' + id, post)
            .subscribe(response => {
                const updatePosts = [...this.posts];
                const oldPostIndex = updatePosts.findIndex(p => p.id === post.id);
                updatePosts[oldPostIndex] = post;
                this.posts = updatePosts;
                this.postsUpdated.next([...this.posts]);
                this.router.navigate(["/"]);
            });
    }

    addPosts(title: string, content: string) {
        const post: Post = {id: null, title: title, content: content};
        this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
            .subscribe((responseData) => {
                const postId = responseData.postId;
                post.id = postId;
                this.posts.push(post);
                this.postsUpdated.next([...this.posts]);
                this.router.navigate(["/"]);
            });
    }

    deletePost(postId: string) {
        this.http.delete("http://localhost:3000/api/posts/" + postId)
            .subscribe(() => {
                const updatedPosts = this.posts.filter(post => post.id != postId);
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
            })
    }
}