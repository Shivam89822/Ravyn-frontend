import "./FeedLoader.css";

const FeedLoader = () => {
  return (
    <div className="feed-loader-wrapper">
      <div className="feed-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {/* <p className="feed-loader-text">Loading more posts</p> */}
    </div>
  );
};

export default FeedLoader;
