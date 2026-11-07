import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  MessageCircle,
  Share2,
  Video,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  PhoneCall,
  FileText,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { formatCurrency, formatWhatsAppLink } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EnquiryModal } from '../../components/common/EnquiryModal';

export const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryModalType, setEnquiryModalType] = useState('Exact Project Enquiry');

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const phone = import.meta.env.VITE_BUSINESS_PHONE || '+91 98765 43210';

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await projectService.getById(id);
        setProject(data);

        if (data) {
          const cover =
            data.coverImage ||
            data.imageUrl ||
            (data.images && data.images[0]) ||
            '';
          setActiveImage(cover);

          // Related projects
          const all = await projectService.getAllPublished();
          const related = all
            .filter((p) => p.id !== id && (p.category === data.category || p.location === data.location))
            .slice(0, 3);
          setRelatedProjects(related);
        }
      } catch (err) {
        console.error('Error fetching project details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <LoadingSpinner size="lg" text="Loading completed project gallery..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Project Not Found</h2>
        <p className="text-sm text-neutral-500">
          The completed project post you are looking for may have been removed or unpublished.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Completed Projects</span>
        </Link>
      </div>
    );
  }

  const galleryImages =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : activeImage
      ? [activeImage]
      : [];

  const exactEnquiryUrl = formatWhatsAppLink(
    whatsappNumber,
    `Hello Sleep Star Furniture, I want to enquire about creating the EXACT SAME DESIGN as your completed project: "${project.title}" in ${project.location || 'Coimbatore'}. Reference link: ${window.location.href}`
  );

  const similarEnquiryUrl = formatWhatsAppLink(
    whatsappNumber,
    `Hello Sleep Star Furniture, I am interested in designing a SIMILAR CUSTOMISED DESIGN inspired by: "${project.title}". Reference link: ${window.location.href}`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-brown-600">
        <Link to="/" className="hover:text-olive-700 font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-brown-400" />
        <Link to="/projects" className="hover:text-olive-700 font-medium">Completed Projects</Link>
        {project.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-brown-400" />
            <span className="text-olive-800 font-semibold">{project.category}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-brown-400" />
        <span className="text-brown-950 font-bold truncate max-w-xs">
          {project.title}
        </span>
      </nav>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Gallery & Video (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visual View */}
          <div className="relative aspect-4/3 rounded-3xl bg-brown-50 overflow-hidden border border-brown-200 shadow-md">
            {activeImage ? (
              <img
                src={activeImage}
                alt={project.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brown-400 font-bold">
                Sleep Star Project
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1.5 rounded-full bg-olive-700 text-white text-xs font-bold shadow-sm">
                {project.category || 'Custom Work'}
              </span>
            </div>

            {project.location && (
              <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brown-950/80 backdrop-blur-xs text-white text-xs font-medium shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-olive-300" />
                <span>{project.location}</span>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImage === img
                      ? 'border-olive-600 ring-2 ring-olive-600/30 scale-102 shadow-sm'
                      : 'border-brown-200 opacity-70 hover:opacity-100 hover:border-olive-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Video Walkthrough Player (if available) */}
          {project.videoUrl && (
            <div className="bg-brown-950 rounded-3xl p-6 text-white space-y-4 shadow-sm border border-brown-900">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-olive-300">
                <Video className="w-4 h-4 text-red-400" />
                <span>Installation Video Walkthrough</span>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                {project.videoUrl.includes('firebasestorage.googleapis.com') ||
                project.videoUrl.endsWith('.mp4') ? (
                  <video
                    src={project.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={project.videoUrl}
                    title="Project Video"
                    className="w-full h-full"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Details & Enquiry CTAs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-brown-600">
              {project.location && (
                <span className="flex items-center space-x-1 font-semibold text-brown-900">
                  <MapPin className="w-3.5 h-3.5 text-olive-700" />
                  <span>{project.location}</span>
                </span>
              )}
              {project.completionDate && (
                <span>• Completed: {project.completionDate}</span>
              )}
            </div>

            <h1 className="text-3xl font-black tracking-tight text-brown-950 leading-tight">
              {project.title}
            </h1>
          </div>

          {/* Pricing / Investment Card */}
          {project.price && (
            <div className="p-5 rounded-2xl bg-white border border-brown-200 shadow-2xs space-y-1">
              <div className="text-xs uppercase tracking-wider text-brown-600 font-bold">
                Project Investment / Estimate
              </div>
              <div className="text-2xl font-black text-brown-950">
                {typeof project.price === 'number'
                  ? formatCurrency(project.price)
                  : project.price}
              </div>
              <p className="text-[11px] text-brown-600">
                Final quotation varies according to exact room dimensions and hardware selections.
              </p>
            </div>
          )}

          {/* THE TWO MANDATORY BUSINESS ENQUIRY OPTIONS */}
          <div className="p-6 rounded-3xl bg-brown-950 text-white space-y-4 shadow-md border border-brown-900">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-olive-300 font-bold">
                Bespoke Fabrication Options
              </span>
              <h3 className="text-lg font-bold text-white">
                Love this design for your home?
              </h3>
              <p className="text-xs text-brown-200">
                Choose how you'd like our master woodcraft team to adapt this project for your residence:
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Exact Same Design */}
              <a
                href={exactEnquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-olive-700 text-white font-bold hover:bg-olive-800 transition-colors text-xs shadow-sm cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-olive-200" />
                  <span>1. Request Exact Same Design</span>
                </span>
                <span className="text-[11px] text-olive-200 font-semibold">WhatsApp →</span>
              </a>

              {/* Option 2: Similar Customised Design */}
              <a
                href={similarEnquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-brown-700 bg-brown-900/90 text-white font-semibold hover:bg-brown-800 transition-colors text-xs cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-olive-300" />
                  <span>2. Request Similar Customised Design</span>
                </span>
                <span className="text-[11px] text-brown-300">WhatsApp →</span>
              </a>

              {/* Option 3: Online Site Measurement / Custom Quotation Form */}
              <button
                type="button"
                onClick={() => {
                  setEnquiryModalType('Exact Project Enquiry');
                  setIsEnquiryModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-brown-700 bg-brown-900/40 text-brown-200 font-semibold hover:bg-brown-800 transition-colors text-xs cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-olive-300" />
                  <span>3. Submit Site Details & Floorplan Online</span>
                </span>
                <span className="text-[11px] text-brown-300">Form →</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-brown-300 bg-white text-brown-900 text-xs font-semibold hover:bg-olive-50 transition-colors shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-olive-700" />
              <span>Call Specialist</span>
            </a>

            <button
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-brown-300 bg-white text-brown-900 text-xs font-semibold hover:bg-olive-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-olive-700" />
              <span>{copied ? 'Link Copied!' : 'Share Portfolio'}</span>
            </button>
          </div>

          {/* Description */}
          {project.description && (
            <div className="pt-4 border-t border-brown-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brown-950">
                Project Overview & Execution
              </h3>
              <p className="text-xs text-brown-800/85 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>
          )}

          {/* Materials Used */}
          {project.materials && (
            <div className="p-4 rounded-2xl bg-brown-50 border border-brown-200 space-y-1.5 text-xs">
              <span className="font-bold text-brown-950 block uppercase tracking-wider text-[11px]">
                Materials & Hardware Specified:
              </span>
              <p className="text-brown-800 leading-relaxed font-medium">
                {project.materials}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="pt-12 border-t border-brown-200 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-olive-700">
                More Real Work
              </span>
              <h2 className="text-2xl font-black text-brown-950 tracking-tight mt-1">
                More Completed Projects
              </h2>
            </div>
            <Link to="/projects" className="text-xs font-bold text-olive-700 hover:text-olive-800 hover:underline">
              View All Works →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((rel) => {
              const relCover = rel.coverImage || (rel.images && rel.images[0]) || '';
              return (
                <Link
                  key={rel.id}
                  to={`/projects/${rel.id}`}
                  className="group bg-white rounded-3xl border border-brown-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-olive-500 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-4/3 bg-brown-50 overflow-hidden">
                    {relCover ? (
                      <img
                        src={relCover}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brown-400">
                        Sleep Star Project
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-olive-700">
                      {rel.category}
                    </span>
                    <h4 className="font-extrabold text-sm text-brown-950 group-hover:text-olive-700 truncate">
                      {rel.title}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Online Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        defaultType={enquiryModalType}
        relatedItemId={project.id}
        relatedItemName={project.title}
        title={`Custom Woodwork Enquiry: "${project.title}"`}
        subtitle="Submit your room dimensions or floorplan image and our carpenter will provide an estimate."
      />
    </div>
  );
};
