import React from 'react';
import { usePosts } from '../context/PostsContext';

interface FeaturedActionBlocksProps {
  onSelectPost: (slug: string) => void;
}

export const FeaturedActionBlocks: React.FC<FeaturedActionBlocksProps> = ({
  onSelectPost,
}) => {
  const { posts } = usePosts();

  // Get active published posts
  const publishedPosts = posts.filter(p => p.status === 'published');

  // Palette matching the exact vibrant multi-color block style from the screenshot
  const blockColors = [
    { bg: 'bg-[#858000] hover:bg-[#736e00]', border: 'border-[#666200]' }, // 1. Olive / Mustard Green
    { bg: 'bg-[#0022cc] hover:bg-[#001bb3]', border: 'border-[#001799]' }, // 2. Royal Blue
    { bg: 'bg-[#ff6600] hover:bg-[#e65c00]', border: 'border-[#cc5200]' }, // 3. Orange
    { bg: 'bg-[#8c0000] hover:bg-[#730000]', border: 'border-[#590000]' }, // 4. Dark Maroon Red
    { bg: 'bg-[#ff2200] hover:bg-[#e61e00]', border: 'border-[#cc1900]' }, // 5. Bright Fire Red
    { bg: 'bg-[#006600] hover:bg-[#004d00]', border: 'border-[#003800]' }, // 6. Forest Green
    { bg: 'bg-[#e60099] hover:bg-[#cc0088]', border: 'border-[#b30077]' }, // 7. Magenta / Hot Pink
    { bg: 'bg-[#0088ff] hover:bg-[#0077e6]', border: 'border-[#0066cc]' }, // 8. Sky Blue
  ];

  // Pick 8 prominent posts from our database
  const activeItems = publishedPosts.slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2">
        {activeItems.map((post, idx) => {
          const color = blockColors[idx % blockColors.length];

          // Format title to match the classic concise action headline style
          const actionText = post.category === 'results' 
            ? 'Check Result'
            : post.category === 'admit-card'
            ? 'Download Admit Card'
            : post.category === 'answer-key'
            ? 'Answer Key 2026'
            : 'Apply Online';

          return (
            <button
              key={post.id}
              onClick={() => onSelectPost(post.slug)}
              className={`${color.bg} text-white font-bold text-xs sm:text-[13px] leading-snug p-2.5 sm:p-3 min-h-[50px] sm:min-h-[64px] flex items-center justify-center text-center transition-all duration-150 shadow-xs hover:shadow-md hover:brightness-105 active:scale-[0.99] cursor-pointer rounded-xs`}
            >
              <span className="line-clamp-2 drop-shadow-xs">
                {post.title} {actionText}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
