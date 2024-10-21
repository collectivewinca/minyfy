import { useState, useEffect } from 'react';
import { FaArrowUp, FaCalendarAlt, FaComments, FaSpinner } from 'react-icons/fa';

export default function RedditViewer() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRedditData = async () => {
      try {
        const postUrl = 'https://www.reddit.com/r/lastfm/comments/1g83phu/top_10_songs_starting_with_letter_p.json';
        const response = await fetch(postUrl);
        const data = await response.json();

        const postData = data[0].data.children[0].data;
        const commentsData = data[1].data.children;

        setPost(postData);
        setComments(commentsData);
      } catch (err) {
        setError('Failed to load Reddit data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRedditData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <FaSpinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Post Section */}
      {post && (
        <div className="border border-gray-200 shadow-sm p-4 rounded-lg">
          <div className="mb-4">
            <h2 className="text-xl font-bold">{post.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span>Posted by u/{post.author}</span>
              <span>•</span>
              <FaCalendarAlt className="h-4 w-4" />
              <span>{formatDate(post.created_utc)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <FaArrowUp className="h-5 w-5" />
              <span>{post.score}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaComments className="h-5 w-5" />
              <span>{post.num_comments} comments</span>
            </div>
          </div>
          <p className="whitespace-pre-wrap">{post.selftext}</p>
        </div>
      )}

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Comments</h2>
        {comments.map((comment) => {
          if (!comment.data.body) return null;

          return (
            <div key={comment.data.id} className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="font-medium">u/{comment.data.author}</span>
                <span>•</span>
                <span>{formatDate(comment.data.created_utc)}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FaArrowUp className="h-4 w-4" />
                <span className="text-sm">{comment.data.score}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{comment.data.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
