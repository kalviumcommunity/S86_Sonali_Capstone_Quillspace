import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CoverImage from '../components/CoverImage';
import ImageCropModal from '../components/ImageCropModal';
import ImageAdjustModal from '../components/ImageAdjustModal';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Edit3, PenTool, Upload, Send, FileText, Check, Loader2, Crop, Sliders, Trash2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

const CreatePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEditing = !!postId;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    coverImage: '',
    coverImageSettings: { zoom: 1, x: 50, y: 50, fit: 'contain' },
    status: 'published',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Load existing post data if editing
  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPost = async () => {
    try {
      const res = await api.get(`/posts/${postId}`);
      const post = res.data.data.post;

      // Verify ownership
      if (post.author._id !== user?._id && post.author !== user?._id) {
        setError('You are not authorized to edit this post.');
        return;
      }

      setFormData({
        title: post.title || '',
        content: post.content || '',
        tags: post.tags?.join(', ') || '',
        coverImage: post.coverImage || '',
        coverImageSettings: post.coverImageSettings || { zoom: 1, x: 50, y: 50, fit: 'contain' },
        status: post.status || 'published',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to load post';
      setError(msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accepted formats: JPG, JPEG, PNG, WEBP
    const validExtensions = /\.(jpe?g|png|webp)$/i;
    const validMimes = /^image\/(jpe?g|png|webp)$/i;

    const isExtValid = validExtensions.test(file.name);
    const isMimeValid = validMimes.test(file.type);

    if (!isExtValid && !isMimeValid) {
      setError('Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Maximum allowed size is 5MB.');
      e.target.value = '';
      return;
    }

    setImageUploading(true);
    setError('');

    try {
      const formDataImg = new FormData();
      formDataImg.append('image', file);

      const res = await api.post('/upload', formDataImg, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = res.data?.data?.imageUrl || res.data?.data?.url;
      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          coverImage: uploadedUrl,
          coverImageSettings: { zoom: 1, x: 50, y: 50, fit: 'contain' },
        }));
      } else {
        throw new Error('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Image upload failed';
      setError(msg);
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e, submitStatus) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (formData.content.trim().length < 10) {
      setError('Content must be at least 10 characters');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
          : [],
        coverImage: formData.coverImage,
        coverImageSettings: formData.coverImageSettings,
        status: submitStatus || formData.status,
      };

      let res;
      if (isEditing) {
        res = await api.put(`/posts/${postId}`, payload);
      } else {
        res = await api.post('/posts', payload);
      }

      const savedPost = res.data.data.post;
      navigate(`/post/${savedPost.slug}`);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      const msg =
        serverErrors && serverErrors.length > 0
          ? serverErrors.map((e) => e.msg).join('; ')
          : err.response?.data?.message ||
            err.message ||
            (isEditing ? 'Failed to update post' : 'Failed to create post');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center">
              {isEditing ? (
                <>
                  <Edit3 className="w-8 h-8 mr-3" /> Edit Post
                </>
              ) : (
                <>
                  <PenTool className="w-8 h-8 mr-3" /> Create Post
                </>
              )}
            </h1>
            <p className="text-text-secondary mt-1">
              {isEditing ? 'Update your article' : 'Share your ideas with the community'}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-text-secondary hover:text-accent transition-colors text-sm"
          >
            ← Back
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <form onSubmit={(e) => handleSubmit(e, 'published')}>
            {/* Title */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="An interesting title for your post..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors text-lg"
                />
                <p className="text-xs text-text-secondary/50 mt-1">{formData.title.length}/200</p>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Cover Image</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg or upload below"
                    className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors text-sm"
                  />
                  <input
                    ref={fileInputRef}
                    id="coverImageFileInput"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="flex items-center px-4 py-3 bg-surface border border-border rounded-xl text-text-secondary hover:text-accent hover:border-accent transition-colors cursor-pointer text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {imageUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin text-accent" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {formData.coverImage ? 'Change' : 'Upload'}
                        </>
                      )}
                    </button>

                    {formData.coverImage && (
                      <>
                        {/* CROP BUTTON */}
                        <button
                          type="button"
                          onClick={() => setIsCropModalOpen(true)}
                          disabled={imageUploading}
                          className="flex items-center px-4 py-3 bg-surface border border-border rounded-xl text-text-secondary hover:text-accent hover:border-accent transition-colors text-sm whitespace-nowrap"
                          title="Select an area to crop the actual image"
                        >
                          <Crop className="w-4 h-4 mr-2 text-accent" />
                          Crop
                        </button>

                        {/* ADJUST BUTTON */}
                        <button
                          type="button"
                          onClick={() => setIsAdjustModalOpen(true)}
                          disabled={imageUploading}
                          className="flex items-center px-4 py-3 bg-surface border border-border rounded-xl text-text-secondary hover:text-accent hover:border-accent transition-colors text-sm whitespace-nowrap"
                          title="Position and scale image inside the 16:9 frame"
                        >
                          <Sliders className="w-4 h-4 mr-2 text-accent" />
                          Adjust
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              coverImage: '',
                              coverImageSettings: { zoom: 1, x: 50, y: 50, fit: 'contain' },
                            }))
                          }
                          className="flex items-center px-4 py-3 bg-surface border border-border hover:border-red-500/40 text-text-secondary hover:text-red-400 rounded-xl transition-colors text-sm whitespace-nowrap"
                          title="Delete cover image"
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 16:9 Uncropped Preview */}
                {formData.coverImage && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-text-secondary/70 mb-2 px-1">
                      <span>16:9 Cover Preview</span>
                      <span className="text-text-secondary/50">Full image preserved by default</span>
                    </div>
                    <CoverImage
                      src={formData.coverImage}
                      settings={formData.coverImageSettings}
                      alt="Cover preview"
                      className="rounded-xl"
                    />
                  </div>
                )}

                {/* Crop Modal (Actually crops the image source) */}
                <ImageCropModal
                  isOpen={isCropModalOpen}
                  imageUrl={formData.coverImage}
                  onClose={() => setIsCropModalOpen(false)}
                  onSave={(newUrl) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverImage: newUrl,
                      coverImageSettings: { zoom: 1, x: 50, y: 50, fit: 'contain' },
                    }))
                  }
                  api={api}
                />

                {/* Adjust Modal (Only frames the image in 16:9 container) */}
                <ImageAdjustModal
                  isOpen={isAdjustModalOpen}
                  imageUrl={formData.coverImage}
                  currentSettings={formData.coverImageSettings}
                  onClose={() => setIsAdjustModalOpen(false)}
                  onSave={(newSettings) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverImageSettings: newSettings,
                    }))
                  }
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Content <span className="text-red-400">*</span>
                </label>
                <div data-color-mode="dark" className="rounded-xl overflow-hidden">
                  <MDEditor
                    value={formData.content}
                    onChange={(val) => setFormData((prev) => ({ ...prev, content: val || '' }))}
                    preview="live"
                    height={500}
                    className="w-full bg-surface border border-border focus-within:border-accent transition-colors text-sm"
                  />
                </div>
                <p className="text-xs text-text-secondary/50 mt-1">{formData.content.length} characters</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Tags <span className="text-text-secondary/50 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="technology, programming, design, ai"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors text-sm"
                />
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs bg-accent/10 border border-accent/20 text-[#A5B4FC] rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 flex-wrap">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center flex-1 sm:flex-none px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Publishing...' : isEditing ? <><Check className="w-5 h-5 mr-2" /> Update Post</> : <><Send className="w-5 h-5 mr-2" /> Publish</>}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, 'draft')}
                className="flex items-center justify-center flex-1 sm:flex-none px-8 py-3 border border-border text-text-secondary rounded-xl hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                <FileText className="w-5 h-5 mr-2" /> Save as Draft
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isLoading}
                className="px-6 py-3 text-text-secondary hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
