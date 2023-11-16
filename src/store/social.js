import { defineStore } from 'pinia';
import axios from "axios";
import { useMainStore } from './main'
import { nextTick } from 'vue'


export const useSocialStore = defineStore("social", {
    state: () => ({
        socialPosts: [],
        socialErrors: [],
        socialStatus: null,
        postsLoading: false,
        postsAllLoaded: false,
        socialScrollTop: 0,
        socialScrollPosition: 0,
        postsPage: 1,
        commmentPage: 1,
        postComment: null,
        commentsAllLoaded: false
    }),
    getters: {
        posts: (state) => state.socialPosts,
        errors: (state) => state.socialErrors,
        status: (state) => state.socialStatus,
        loading: (state) => state.postsLoading,
        allLoaded: (state) => state.postsAllLoaded,
        comment: (state) => state.postComment,
        commentsLoaded: (state) => state.commentsAllLoaded,
    },
    actions: {
        getScrollTop(value){
            this.socialScrollTop = value
        },
        async getPosts() {
            this.postsLoading = true;
            this.socialScrollPosition = this.socialScrollTop;
        
            try {
                const response = await axios.get(`/api/posts?page=${this.postsPage}`);
                const newPosts = response.data.posts.data;
                console.log('posts', response.data)
                if (newPosts.length) {
                    this.socialPosts = this.socialPosts.concat(newPosts);
                    this.postsPage++;
                    this.postsLoading = false;
                    nextTick(() => {
                        this.socialScrollTop = this.socialScrollPosition;
                    });
        
                    this.socialPosts.forEach(item => {
                        item.liked_by_user = item.likes.length > 0;
                    });
        
                } else {
                    this.postsAllLoaded = true;
                    this.postsLoading = false;
                }
            } catch (error) {
                console.log(error);
            }
        },
        async getComments(id, page) {
            this.commentsAllLoaded = false;
            try {
                const response = await axios.get(`/api/comments/${id}?page=${page}`);
                const comments = response.data.comments.data;
        
                if (comments.length) {
                    this.socialPosts.forEach(item => {
                        if (item.id === id) {
                            item.comments = page === 1 ? comments : item.comments.concat(comments);
                            item.comment_page = page === 1 ? 2 : item.comment_page + 1;
                        }
                    });
                } else {
                    const item = this.socialPosts.find(item => item.id === id);
                    if (item) item.comments_all_loaded = true;
                    console.log('comments all loaded');
                }
            } catch (error) {
                console.log(error);
            }
        },
        async createComment(formData, id) {
            try {
                this.socialErrors = [];
                const response = await axios.post(`/api/create-comment/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
        
                if (response.data.success) {
                    const commentData = response.data.comment;
                    const comment = {
                        body: commentData.body,
                        user: {
                            name: commentData.user.name,
                            id: commentData.user.id,
                        },
                        attachment: commentData.attachment,
                        id: commentData.id,
                    };
        
                    if (commentData.user.profile) {
                        comment.user.profile = {
                            first_name: commentData.user.profile.first_name,
                            last_name: commentData.user.profile.last_name,
                            profile_photo: commentData.user.profile.profile_photo,
                        };
                    }
        
                    const postToUpdate = this.socialPosts.find(item => item.id === id);
        
                    if (postToUpdate) {
                        console.log('insert comment', postToUpdate);
                        postToUpdate.comments_count++;
                        postToUpdate.comments = postToUpdate.comments || [];
                        postToUpdate.comments.push(comment);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },
        clearComment() {
            this.postComment = null
        },
        async createPost(formData) {
            try {
                this.socialErrors = []
                await axios.post('/api/create-post', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                    console.log('post created', response)
                    if(response.data.success){
                        const main = useMainStore()
                        const alert = {
                            color: 'success',
                            message: 'Post created successfully!'
                        }
                        main.setAlert(alert)
                        response.data.post.likes_count = 0
                        this.socialPosts.unshift(response.data.post)
                    }
                })
            }catch (error) {
                if(error.response.status === 422){
                    const errors = this.processErrors(error.response.data.errors)  
                    this.socialErrors = errors
                    setTimeout(() =>{
                        this.socialErrors = []
                    }, 3000)
                }
            }
        },
        async isLikePost(id) {
            try {
                const response = await axios.post(`/api/post/${id}/like`)
                if (response.data.success) {
                    const liked = response.data.message === 'liked'
                    const postToUpdate = this.socialPosts.find(item => item.id === id)
                    if (postToUpdate) {
                        postToUpdate.likes_count += liked ? 1 : -1
                        postToUpdate.liked_by_user = liked
                    }
                }
            } catch (error) {
                console.log(error)
            }
        },
        processErrors(errors) {
            const processedErrors = {};
            for (const key in errors) {
              if (key.startsWith('attachments.')) {
                const newKey = 'attachments'
                processedErrors[newKey] = errors[key];
              } else {
                processedErrors[key] = errors[key];
              }
            }
            return processedErrors;
        },

    }
})