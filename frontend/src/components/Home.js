import React, { useState, useEffect } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

const Home = () => {
  const [posts, setPosts] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editDialogs, setEditDialogs] = useState({});
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts');
        if (response.ok) {
          const json = await response.json();
          setPosts(json);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchPosts();
  }, [setPosts]);

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post._id !== postId));
        console.log('Post deleted successfully!');
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const confirmDelete = (postId) => {
    setShowConfirmDialog(true);
    setSelectedPostId(postId);
  };

  const handleConfirmDelete = () => {
    handleDelete(selectedPostId);
    setShowConfirmDialog(false);
    setSelectedPostId(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setSelectedPostId(null);
  };

  const confirmEdit = (postId, postTitle, postContent) => {
    setEditedTitle(postTitle);
    setEditedContent(postContent);
    setEditDialogs({ ...editDialogs, [postId]: true });
  };

  const handleEdit = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
        }),
      });

      if (response.ok) {
        console.log(`Post with ID ${postId} updated successfully!`);
        setEditDialogs({ ...editDialogs, [postId]: false });
        setSelectedPostId(null); // To trigger a re-fetch of posts
      } else {
        console.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div className="home-container">
      {posts &&
        posts.map((post) => (
          <div key={post._id} className="blogPost">
            <div className="post-details">
              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">{post.content}</p>
              <div className="post-meta">
                <p className="post-author">By {post.author}</p>
                <p>{formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}</p>
              </div>
              <div className="post-actions">
                <button className="action-button" onClick={() => confirmDelete(post._id)}>
                  Delete
                </button>
                <button className="action-button" onClick={() => confirmEdit(post._id, post.title, post.content)}>
                  Edit
                </button>
              </div>
              {showConfirmDialog && selectedPostId === post._id && (
                <div className="confirm-dialog">
                  <p>Are you sure you want to delete this post?</p>
                  <button className="action-button" onClick={handleConfirmDelete}>
                    Yes
                  </button>
                  <button className="action-button" onClick={handleCancelDelete}>
                    No
                  </button>
                </div>
              )}
              {editDialogs[post._id] && (
                <div className="edit-dialog">
                  <h2>Edit Post</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEdit(post._id);
                    }}
                  >
                    <label htmlFor={`edited-title-${post._id}`}>Title:</label>
                    <input
                      type="text"
                      id={`edited-title-${post._id}`}
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />

                    <label htmlFor={`edited-content-${post._id}`}>Content:</label>
                    <textarea
                      id={`edited-content-${post._id}`}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    ></textarea>

                    <button type="submit">Save</button>
                    <button onClick={() => setEditDialogs({ ...editDialogs, [post._id]: false })}>
                      Cancel
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Home;