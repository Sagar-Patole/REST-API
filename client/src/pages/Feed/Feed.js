import React, { Fragment, useState, useEffect } from 'react';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

const Feed = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState(null);
  const [status, setStatus] = useState('');
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/server/auth/status', {
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    }).then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch user status.');
      }
      return res.json();
    }).then(resData => {
      setStatus(resData.status);
    }).catch(catchError);

    loadPosts();
  }, []);

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const catchError = error => {
    setError(error);
  };

  const deletePostHandler = postId => {
    setPostsLoading(true);
    fetch(`http://localhost:8080/server/feed/post/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Deleting a post failed!');
      }
      return res.json();
    }).then(resData => {
      console.log(resData);
      setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
      setPostsLoading(false);
    }).catch(err => {
      console.log(err);
      setPostsLoading(false);
    });
  };

  const errorHandler = () => {
    setError(null);
  };

  const finishEditHandler = postData => {
    setEditLoading(true);
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image);
    let url = 'http://localhost:8080/server/feed/post';
    let method = 'POST';
    if (editPost) {
      url = `http://localhost:8080/server/feed/post/${editPost._id}`;
      method = 'PUT';
    }

    fetch(url, {
      method: method,
      body: formData,
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Creating or editing a post failed!');
      }
      return res.json();
    }).then(resData => {
      const post = {
        _id: resData.post._id,
        title: resData.post.title,
        content: resData.post.content,
        creator: resData.post.creator,
        createdAt: resData.post.createdAt
      };
      setPosts(prevPosts => {
        let updatedPosts = [...prevPosts];
        if (editPost) {
          const postIndex = prevPosts.findIndex(p => p._id === editPost._id);
          if (postIndex !== -1) {
            updatedPosts[postIndex] = post;
          }
        } else if (prevPosts.length > 2) {
          updatedPosts = prevPosts.concat(post);
        }
        return updatedPosts;
      });
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
    }).catch(err => {
      console.log(err);
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
      setError(err);
    });
  };

  const loadPosts = direction => {
    if (direction) {
      setPostsLoading(true);
      setPosts([]);
    }
    let page = postPage;
    if (direction === 'next') {
      page++;
      setPostPage(page);
    }
    if (direction === 'previous') {
      page--;
      setPostPage(page);
    }
    fetch(`http://localhost:8080/server/feed/posts?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    }).then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch posts.');
      }
      return res.json();
    }).then(resData => {
      const _posts = resData.posts.map(post => {
        return {
          ...post,
          imagePath: post.imageUrl
        };
      })
      setPosts(_posts);
      setTotalPosts(resData.totalItems);
      setPostsLoading(false);
    }).catch(catchError);
  };

  const newPostHandler = () => {
    setIsEditing(true);
  };

  const startEditPostHandler = postId => {
    const loadedPost = posts.find(p => p._id === postId);
    if (loadedPost) {
      setIsEditing(true);
      setEditPost({ ...loadedPost });
    }
  };

  const statusInputChangeHandler = (input, value) => {
    setStatus(value);
  };

  const statusUpdateHandler = event => {
    event.preventDefault();
    fetch('http://localhost:8080/server/auth/status', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status
      })
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Can't update status!");
      }
      return res.json();
    }).then(resData => {
      console.log(resData);
    })
    .catch(catchError);
  };

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className="feed">
        {postsLoading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        )}
        {posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: 'center' }}>No posts found.</p>
        ) : null}
        {!postsLoading && (
          <Paginator
            onPrevious={() => loadPosts('previous')}
            onNext={() => loadPosts('next')}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map(post => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString('en-US')}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={() => startEditPostHandler(post._id)}
                onDelete={() => deletePostHandler(post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
}

export default Feed;
