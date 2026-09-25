import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CTASection from '../../components/common/CTASection';
import { blogPosts } from '../../constants/site';
import api from '../../services/api';

const articleContent = `
<p>Học lái xe là quá trình cần sự kiên nhẫn, luyện tập định kỳ và hiểu rõ quy trình học tập. Tại Tuyên Quang, nhiều học viên mới bắt đầu thường băn khoăn về thời gian học, hồ sơ cần chuẩn bị và quy tắc thi. </p>
<p>Để học tốt, bạn nên bắt đầu từ việc tìm hiểu rõ mục tiêu học bằng lái xe, loại xe muốn học và lộ trình phù hợp. Việc nắm rõ quy trình học sẽ giúp bạn tối ưu thời gian, tiết kiệm chi phí và có hướng đi rõ ràng hơn.</p>
<p>Học viên nên dành thời gian ôn lại phần lý thuyết, làm quen với giao thông và luyện tập từng kỹ năng cơ bản trước khi thi. Trong giai đoạn đầu, ưu tiên kỹ năng an toàn, quan sát và kiểm soát xe sẽ đem lại hiệu quả tốt hơn so với việc cố gắng đi nhanh.</p>
<p>Đối với người mới, hãy chọn chương trình học có hướng dẫn từng bước, phù hợp với thời gian rảnh và khả năng của bản thân. Khi đã hiểu rõ quy trình, bạn sẽ thấy việc học lái xe trở nên dễ dàng hơn rất nhiều.</p>
`;

function BlogDetail() {
  const { slug } = useParams();
  const fallbackPost = blogPosts.find((item) => item.slug === slug) ?? blogPosts[0];
  const [post, setPost] = useState(fallbackPost);
  const [relatedPosts, setRelatedPosts] = useState(blogPosts);

  useEffect(() => {
    api.get(`/posts/${slug}`)
      .then((response) => {
        if (response.data?.data) setPost(response.data.data);
      })
      .catch(() => {
        setPost(fallbackPost);
      });

    api.get('/posts')
      .then((response) => {
        const posts = (response.data?.data || []).filter((item) => item.status === 'published' && item.slug !== slug);
        if (posts.length) setRelatedPosts(posts);
      })
      .catch(() => {
        setRelatedPosts(blogPosts.filter((item) => item.slug !== slug));
      });
  }, [slug]);

  return (
    <div className="container-shell py-12 sm:py-16">
      <nav className="mb-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
          <span>/</span>
          <Link to="/kinh-nghiem" className="hover:text-blue-700">Kinh nghiệm</Link>
          <span>/</span>
          <span className="max-w-[18rem] truncate text-slate-700">{post.title}</span>
        </div>
      </nav>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <img src={post.thumbnail} alt={post.title} className="h-72 w-full object-cover sm:h-[28rem]" />
        <div className="p-6 sm:p-8">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0057B8]">{post.category || 'Kinh nghiệm'}</span>
          <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight text-[#0B3B78] sm:text-5xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span>Đăng ngày: {new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
            <span>{post.views || 0} lượt xem</span>
            <span>Tác giả: Admin</span>
          </div>
          {post.excerpt ? <p className="mt-8 rounded-2xl border-l-4 border-[#FFC400] bg-yellow-50 px-5 py-4 text-lg font-medium leading-8 text-[#0B3B78]">{post.excerpt}</p> : null}
          <div className="article-content mt-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: post.content || articleContent }} />
        </div>
      </article>

      <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-2xl font-bold text-slate-900">Bạn đang tìm khóa học phù hợp?</h3>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row">
          <Link to="/hoc-lai-xe-o-to" className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
            Xem khóa học ô tô
          </Link>
          <Link to="/hoc-lai-xe-may" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-700">
            Xem khóa học xe máy
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold text-slate-900">Bài viết liên quan</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {relatedPosts.slice(0, 3).map((relatedPost) => (
            <Link key={relatedPost._id || relatedPost.id} to={`/kinh-nghiem/${relatedPost.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
              <img src={relatedPost.thumbnail} alt={relatedPost.title} className="h-44 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0057B8]">{relatedPost.category || 'Kinh nghiệm'}</p>
                <h4 className="mt-2 text-lg font-bold text-[#0B3B78] group-hover:text-[#E31B23]">{relatedPost.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <CTASection title="Bạn muốn tư vấn khóa học ngay bây giờ?" description="Nhận hỗ trợ từ chuyên gia về chương trình phù hợp với nhu cầu học tập của bạn." />
    </div>
  );
}

export default BlogDetail;
