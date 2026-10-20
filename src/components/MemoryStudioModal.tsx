import React, { useRef, useState } from 'react';
import {
  Film,
  FolderUp,
  ImagePlus,
  Music,
  QrCode,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { GiftConfig, MemoryItem } from '../types/gift';
import {
  getDefaultGiftConfig,
  processBulkUploadedFiles,
} from '../utils/defaultMemories';
import { ROMANTIC_TRACKS } from '../utils/romanticAudio';

interface MemoryStudioModalProps {
  isOpen: boolean;
  giftConfig: GiftConfig;
  isSavingServer: boolean;
  onClose: () => void;
  onSaveGiftConfig: (
    updated: GiftConfig,
    openQrAfterSave: boolean
  ) => Promise<void>;
}

export const MemoryStudioModal: React.FC<MemoryStudioModalProps> = ({
  isOpen,
  giftConfig,
  isSavingServer,
  onClose,
  onSaveGiftConfig,
}) => {
  const [draft, setDraft] = useState<GiftConfig>(giftConfig);
  const [activeTab, setActiveTab] = useState<'photos' | 'letter' | 'music'>(
    'photos'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusNote, setStatusNote] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [replaceSamplesOnBulk, setReplaceSamplesOnBulk] = useState(false);

  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setDraft(giftConfig);
      setStatusNote('');
      setProgressPercent(0);
    }
  }, [isOpen, giftConfig]);

  if (!isOpen) return null;

  const handleBulkImportFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgressPercent(5);
    setStatusNote('Đang xử lý song song ảnh, HEIC, video (.mov/.mp4/.webm) & .zip...');

    try {
      const importedItems = await processBulkUploadedFiles(
        files,
        (done, total, text) => {
          setProgressPercent(Math.round((done / Math.max(total, 1)) * 100));
          setStatusNote(text);
        }
      );

      if (importedItems.length === 0) {
        setStatusNote(
          'Không tìm thấy ảnh hoặc video hợp lệ (.jpg, .png, .heic, .mov, .mp4, .webm, .zip).'
        );
        return;
      }

      const videoCount = importedItems.filter(
        (m) => m.mediaType === 'video'
      ).length;
      const imageCount = importedItems.length - videoCount;
      const firstVideo = importedItems.find((m) => m.mediaType === 'video');
      const firstImage = importedItems.find((m) => m.mediaType !== 'video');

      setDraft((prev) => {
        // Check if current list is just the 6 default sample items
        const isCurrentlyDefaultSamples = prev.memories.every((m) =>
          m.id.startsWith('mem-2010-')
        );
        const shouldReplace = replaceSamplesOnBulk || isCurrentlyDefaultSamples;
        const merged = shouldReplace
          ? importedItems
          : [...importedItems, ...prev.memories].slice(0, 110);

        return {
          ...prev,
          memories: merged,
          loveLetter: {
            ...prev.loveLetter,
            footerPhotoUrl:
              firstImage?.imageUrl ||
              importedItems[0]?.imageUrl ||
              prev.loveLetter.footerPhotoUrl,
            footerVideoUrl:
              firstVideo?.videoUrl || prev.loveLetter.footerVideoUrl,
          },
        };
      });

      setStatusNote(
        `Đã tải thành công ${imageCount} ảnh & ${videoCount} video! Tất cả sẽ phát song song trên Quả Cầu 3D & Thiên Hà.`
      );
    } catch {
      setStatusNote('Có lỗi khi đọc một số tệp, vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplaceSingleItem = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    try {
      const processed = await processBulkUploadedFiles([files[0]]);
      if (processed.length > 0) {
        const replacement = processed[0];
        setDraft((prev) => ({
          ...prev,
          memories: prev.memories.map((m) =>
            m.id === id
              ? {
                  ...m,
                  imageUrl: replacement.imageUrl,
                  videoUrl: replacement.videoUrl,
                  mediaType: replacement.mediaType,
                }
              : m
          ),
        }));
        setStatusNote('Đã cập nhật tệp thành công.');
      }
    } catch {
      setStatusNote('Không thể thay tệp này.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleUpdateMemoryField = (
    id: string,
    field: keyof MemoryItem,
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      memories: prev.memories.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleDeleteMemory = (id: string) => {
    if (draft.memories.length <= 1) {
      setStatusNote('Cần giữ ít nhất 1 bức ảnh hoặc video.');
      return;
    }
    setDraft((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  };

  const handleClearAllMemories = () => {
    setDraft((prev) => ({
      ...prev,
      memories: prev.memories.slice(0, 1),
    }));
    setStatusNote('Đã dọn danh sách để bạn tải thư mục ảnh/video mới.');
  };

  const handleUploadCustomMp3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setStatusNote('Vui lòng chọn file nhạc nhỏ hơn 25MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({
        ...prev,
        customAudioDataUrl: reader.result as string,
        customAudioName: file.name,
      }));
      setStatusNote(`Đã gắn nhạc: ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetDefault = () => {
    const def = getDefaultGiftConfig();
    setDraft(def);
    setStatusNote('Đã khôi phục mặc định.');
  };

  const handleUpdatePhrase = (idx: number, val: string) => {
    const arr = [...(draft.particlePhrases || [])];
    arr[idx] = val;
    setDraft((prev) => ({ ...prev, particlePhrases: arr }));
  };

  const videoCountInDraft = draft.memories.filter(
    (m) => m.mediaType === 'video'
  ).length;
  const imageCountInDraft = draft.memories.length - videoCountInDraft;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-[#ff85c0]/40 bg-[#12041c]/95 text-white shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#ff85c0]">
              Tải Nhanh Cả Thư Mục Ảnh & Video (Hỗ trợ .JPG, .PNG, .HEIC, .MOV, .MP4, .WEBM, .ZIP)
            </h2>
            <p className="text-xs text-white/65">
              Tải lên 50–100+ ảnh & video cùng lúc — phát video song song trên Quả Cầu 3D, Thiên Hà & Lá Thư
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-5 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`pb-1 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'border-b-2 border-[#ff2a85] text-[#ff85c0]'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              📸 Ảnh ({imageCountInDraft}) & 🎬 Video ({videoCountInDraft})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('letter')}
              className={`pb-1 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'letter'
                  ? 'border-b-2 border-[#ff2a85] text-[#ff85c0]'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              💌 Chữ Hạt & Thư 20/10
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('music')}
              className={`pb-1 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'music'
                  ? 'border-b-2 border-[#ff2a85] text-[#ff85c0]'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              🎵 Nhạc Nền
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClearAllMemories}
              className="inline-flex items-center gap-1 text-xs text-rose-300/80 hover:text-rose-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa bớt danh sách</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Khôi phục gốc</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 sm:p-6 space-y-5">
          {statusNote && (
            <div className="rounded-xl border border-[#ff85c0]/40 bg-[#ff2a85]/15 px-4 py-2.5 text-xs font-medium text-[#ffd6eb] space-y-1.5">
              <div className="flex items-center justify-between">
                <span>{statusNote}</span>
                {isProcessing && <span>{progressPercent}%</span>}
              </div>
              {isProcessing && (
                <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff2a85] to-[#ff85c0] transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {/* Drag & Drop + 1-Click Folder & Multi-File Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleBulkImportFiles(e.dataTransfer.files);
                  }
                }}
                className={`rounded-2xl border-2 border-dashed p-5 transition-all ${
                  isDraggingOver
                    ? 'border-[#ff2a85] bg-[#ff2a85]/20 scale-[1.01]'
                    : 'border-[#ff85c0]/50 bg-white/[0.03]'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#ffb3d9]">
                      ⚡ Kéo thả trực tiếp hoặc Chọn cả thư mục (Ví dụ: D:\huyền\ảnh)
                    </h3>
                    <p className="text-xs text-white/65">
                      Hỗ trợ chọn 50–100+ file cùng lúc: Ảnh (.JPG, .PNG, .HEIC iPhone), Video (.MOV, .MP4, .WEBM) và cả file nén (.ZIP). Các video sẽ tự động chiếu song song trên Quả Cầu 3D & Thiên Hà!
                    </p>
                    <label className="inline-flex items-center gap-2 pt-1.5 text-xs text-[#ffd6eb] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={replaceSamplesOnBulk}
                        onChange={(e) =>
                          setReplaceSamplesOnBulk(e.target.checked)
                        }
                        className="rounded accent-[#ff2a85]"
                      />
                      <span>
                        Thay thế toàn bộ ảnh mẫu bằng bộ ảnh/video vừa chọn của bạn
                      </span>
                    </label>
                  </div>

                  {/* Hidden Inputs for Multi-file and Whole Directory */}
                  <input
                    ref={multiFileInputRef}
                    type="file"
                    accept="image/*,video/*,.heic,.heif,.mov,.mp4,.webm,.zip"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleBulkImportFiles(e.target.files);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  <input
                    ref={folderInputRef}
                    type="file"
                    {...({
                      webkitdirectory: '',
                      directory: '',
                    } as React.InputHTMLAttributes<HTMLInputElement>)}
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleBulkImportFiles(e.target.files);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => folderInputRef.current?.click()}
                      className="flex min-h-[42px] items-center gap-2 rounded-full bg-gradient-to-r from-[#ff2a85] to-[#e11d48] text-white px-5 py-2 text-xs font-bold shadow-[0_0_20px_rgba(255,42,133,0.6)] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <FolderUp className="h-4 w-4" />
                      <span>
                        {isProcessing
                          ? 'Đang tải...'
                          : 'Chọn Cả Thư Mục (Ảnh + Video)'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => multiFileInputRef.current?.click()}
                      className="flex min-h-[42px] items-center gap-2 rounded-full border border-[#ff85c0] bg-[#ff2a85]/25 text-white px-4 py-2 text-xs font-bold hover:bg-[#ff2a85] transition-all cursor-pointer whitespace-nowrap"
                    >
                      <ImagePlus className="h-4 w-4" />
                      <span>Chọn Nhiều File / .MOV / .ZIP</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid of Uploaded Photos & Live Videos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {draft.memories.map((mem, idx) => (
                  <div
                    key={mem.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ff85c0]/40 bg-black">
                      {mem.mediaType === 'video' && mem.videoUrl ? (
                        <video
                          src={mem.videoUrl}
                          muted
                          loop
                          playsInline
                          autoPlay
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={mem.imageUrl}
                          alt={mem.caption}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      )}
                      {mem.mediaType === 'video' && (
                        <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-[#ff2a85] px-1 py-0.5 text-[9px] font-bold text-white">
                          <Film className="h-2.5 w-2.5" /> VID
                        </span>
                      )}
                      <span className="absolute top-1 left-1 rounded bg-black/65 px-1 text-[9px] text-white/80">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        type="text"
                        value={mem.caption}
                        onChange={(e) =>
                          handleUpdateMemoryField(
                            mem.id,
                            'caption',
                            e.target.value
                          )
                        }
                        placeholder="Chú thích..."
                        className="w-full rounded-lg border border-white/15 bg-black/50 px-2 py-1 text-xs font-semibold text-white focus:border-[#ff85c0] focus:outline-none"
                      />
                      <div className="flex items-center gap-3">
                        <input
                          ref={(el) => {
                            replaceInputRefs.current[mem.id] = el;
                          }}
                          type="file"
                          accept="image/*,video/*,.heic,.mov,.mp4,.webm"
                          onChange={(e) => handleReplaceSingleItem(mem.id, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            replaceInputRefs.current[mem.id]?.click()
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-[#ff85c0] hover:underline cursor-pointer"
                        >
                          <Upload className="h-3 w-3" />
                          <span>Đổi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMemory(mem.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:underline cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'letter' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ff85c0]">
                  1. Các câu chữ tạo từ hạt bụi sao hồng (Màn mở đầu)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx}>
                      <label className="block text-[11px] text-white/55 mb-1">
                        Cảnh chữ #{idx + 1} (dùng Enter để xuống dòng):
                      </label>
                      <textarea
                        rows={2}
                        value={draft.particlePhrases?.[idx] || ''}
                        onChange={(e) =>
                          handleUpdatePhrase(idx, e.target.value)
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-[#ff85c0] focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ff85c0]">
                  2. Nội dung Thiệp Hồng Gõ Chữ Từng Ký Tự
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">
                      Lời mở đầu:
                    </label>
                    <input
                      type="text"
                      value={draft.loveLetter.recipient}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          loveLetter: {
                            ...prev.loveLetter,
                            recipient: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-[#ff85c0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">
                      Chữ ký kết thư:
                    </label>
                    <input
                      type="text"
                      value={draft.loveLetter.signature}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          loveLetter: {
                            ...prev.loveLetter,
                            signature: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:border-[#ff85c0] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1">
                    Lời chúc trong thư:
                  </label>
                  <textarea
                    rows={4}
                    value={draft.loveLetter.body}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        loveLetter: {
                          ...prev.loveLetter,
                          body: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white leading-relaxed focus:border-[#ff85c0] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'music' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ff85c0] mb-2">
                  1. Nhạc đoạn đầu (Khi mở đầu & hiện chữ, bó hoa)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ROMANTIC_TRACKS.map((track) => {
                    const isSelected = draft.musicTrackIndex === track.index;
                    return (
                      <button
                        key={track.index}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            musicTrackIndex: track.index,
                          }))
                        }
                        className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#ff2a85] bg-[#ff2a85]/20'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                        }`}
                      >
                        <Music className="h-4 w-4 text-[#ff85c0] mb-2" />
                        <span className="text-sm font-bold text-white">
                          {track.title}
                        </span>
                        <span className="text-xs text-white/55 mt-0.5">
                          {track.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#ff85c0]/50 bg-[#ff2a85]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#ffd6eb]">
                    2. Nhạc đoạn sau (Khi bấm vào Bó Hoa chuyển sang Quả Cầu 3D & Thiên Hà — Lặp vòng)
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    {draft.customAudioName
                      ? `Đang phát lặp vòng: ${draft.customAudioName}`
                      : 'Đang phát lặp vòng mặc định: chờ anh chút thôi. #nhachaymoingay #lofi #lyrics #chill.mp3'}
                  </p>
                </div>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleUploadCustomMp3}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border border-[#ff85c0]/50 bg-[#ff2a85]/25 px-4 py-2 text-xs font-bold text-white hover:bg-[#ff2a85] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Đổi file MP3 khác</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            disabled={isSavingServer || isProcessing}
            onClick={() => onSaveGiftConfig(draft, false)}
            className="flex min-h-[42px] items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-5 py-2 text-xs font-bold text-white hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSavingServer ? 'Đang lưu...' : 'Lưu & Áp dụng ngay'}</span>
          </button>

          <button
            type="button"
            disabled={isSavingServer || isProcessing}
            onClick={() => onSaveGiftConfig(draft, true)}
            className="flex min-h-[42px] items-center gap-2 rounded-full bg-[#ff2a85] text-white px-5 py-2 text-xs font-bold shadow-[0_0_20px_rgba(255,42,133,0.6)] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>
              {isSavingServer ? 'Đang tạo mã...' : 'Lưu & Lấy Thiệp QR 20/10'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
