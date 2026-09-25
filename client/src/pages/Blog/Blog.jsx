import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Section from '../../components/common/Section';
import { blogPosts } from '../../constants/site';
import api from '../../services/api';

function Blog() {
  const [posts, setPosts] = useState(blogPosts);

  useEffect(() => {
    api.get('/posts')
      .then((response) => {
        const publishedPosts = (response.data?.data || []).filter((post) => post.status === 'published');
        if (publishedPosts.length) setPosts(publishedPosts);
      })
      .catch(() => {
        // Keep the local content available if the API is temporarily unavailable.
      });
  }, []);

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1);

  return (
    <Section eyebrow="Blog" title="Kinh nghiệm học lái xe tại Tuyên Quang" description="Những bài viết giúp bạn hiểu rõ hơn về quy trình học, hồ sơ, thi sát hạch và những điều nên biết trước khi bắt đầu.">
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        {featuredPost ? (
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
            <div className="relative h-72 overflow-hidden sm:h-96">
              <img src={featuredPost.thumbnail} alt={featuredPost.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              <span className="absolute left-5 top-5 rounded-full bg-[#E31B23] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white">Bài viết nổi bật</span>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0057B8]">{featuredPost.category || 'Kinh nghiệm'}</p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-[#0B3B78] sm:text-3xl">{featuredPost.title}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{featuredPost.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
                <span>{new Date(featuredPost.publishedAt).toLocaleDateString('vi-VN')} · {featuredPost.views || 0} lượt xem</span>
                <Link to={`/kinh-nghiem/${featuredPost.slug}`} className="rounded-full bg-[#0057B8] px-4 py-2 font-bold text-white hover:bg-[#0B3B78]">Đọc bài viết</Link>
              </div>
            </div>
          </article>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {secondaryPosts.map((post) => (
            <article key={post._id || post.id} className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft sm:grid-cols-[9rem_1fr] lg:grid-cols-[10rem_1fr]">
              <img src={post.thumbnail} alt={post.title} className="h-48 w-full object-cover sm:h-full" />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0057B8]">{post.category || 'Kinh nghiệm'}</p>
                <h2 className="mt-2 text-lg font-bold leading-snug text-[#0B3B78]">{post.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{post.views || 0} lượt xem</span>
                  <Link to={`/kinh-nghiem/${post.slug}`} className="font-bold text-[#E31B23]">Đọc thêm</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default Blog;
