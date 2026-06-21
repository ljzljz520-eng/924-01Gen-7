import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Image,
  Calendar,
  Cloud,
  Plane,
  BookOpen,
  Palette,
  Ruler,
  Shield,
  Check,
  AlertCircle,
  ChevronRight,
  X,
  Tag,
} from 'lucide-react';
import type {
  StickerCategory,
  PrintSize,
  ColorMode,
  LicenseType,
  UploadFormData,
} from '../../shared/types';
import {
  CATEGORY_LABELS,
  PRINT_SIZE_LABELS,
  COLOR_MODE_LABELS,
  LICENSE_TYPE_LABELS,
} from '../../shared/types';

const categoryIcons: Record<StickerCategory, typeof Calendar> = {
  date: Calendar,
  weather: Cloud,
  travel: Plane,
  study: BookOpen,
};

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    category: 'date',
    printSize: 'medium',
    colorMode: 'rgb',
    licenseType: 'personal',
    widthMm: 40,
    heightMm: 40,
    tags: '',
  });

  const handleFileChange = (file: File) => {
    if (!file.type.match(/image\/(png|jpeg|jpg|svg\+xml)|application\/pdf/)) {
      setError('只支持 PNG, SVG, PDF, JPG 格式');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }
    setUploadedFile(file);
    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateFormData = (key: keyof UploadFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    if (currentStep === 1) return uploadedFile !== null;
    if (currentStep === 2) return formData.title.trim() !== '' && formData.category;
    if (currentStep === 3) return formData.widthMm > 0 && formData.heightMm > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('file', uploadedFile);
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('category', formData.category);
      form.append('printSize', formData.printSize);
      form.append('colorMode', formData.colorMode);
      form.append('licenseType', formData.licenseType);
      form.append('widthMm', String(formData.widthMm));
      form.append('heightMm', String(formData.heightMm));
      form.append('tags', formData.tags);
      form.append('authorName', '插画师');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/browse');
        }, 3000);
      } else {
        throw new Error(data.error || '上传失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
        <div className="card p-8 md:p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">
            上传成功！
          </h2>
          <p className="text-gray-500 mb-6">
            你的贴纸作品已成功上传，即将跳转到贴纸浏览页面...
          </p>
          <div className="animate-pulse flex justify-center gap-1">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: '上传文件', icon: Upload },
    { number: 2, title: '基本信息', icon: Tag },
    { number: 3, title: '打印设置', icon: Ruler },
    { number: 4, title: '确认提交', icon: Check },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-gray-800 mb-2">
            上传你的贴纸作品
          </h1>
          <p className="text-gray-500">
            分享你的创意，让更多人看到你的设计
          </p>
        </div>

        <div className="flex justify-between items-center mb-8 px-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep > step.number
                      ? 'bg-primary-500 text-white'
                      : currentStep === step.number
                      ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-50'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all duration-300 ${
                    currentStep > step.number ? 'bg-primary-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-xl text-gray-800">
                选择贴纸文件
              </h2>
              <p className="text-gray-500">
                支持 PNG, SVG, PDF, JPG 格式，最大 10MB
              </p>

              <div
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-cream-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="预览"
                      className="max-h-64 mx-auto rounded-2xl shadow-soft"
                    />
                    <button
                      onClick={removeFile}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                      {uploadedFile?.name} ({(uploadedFile?.size! / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Image className="w-10 h-10 text-primary-400" />
                    </div>
                    <p className="text-gray-600 mb-2">
                      拖拽文件到这里，或
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                    >
                      选择文件
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.svg,.pdf,.jpg,.jpeg"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  PNG（推荐透明背景）
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  SVG（矢量图）
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  PDF（印刷专用）
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  高分辨率（推荐 300 DPI）
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-xl text-gray-800">
                填写基本信息
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  贴纸标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="给你的贴纸起个好听的名字"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  贴纸描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="描述一下你的贴纸特点和用途..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  贴纸分类 *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.keys(CATEGORY_LABELS) as StickerCategory[]).map((cat) => {
                    const Icon = categoryIcons[cat];
                    const isSelected = formData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateFormData('category', cat)}
                        className={`p-4 rounded-2xl border-2 transition-all text-center ${
                          isSelected
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-200 hover:bg-cream-50'
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 mx-auto mb-2 ${
                            isSelected ? 'text-primary-500' : 'text-gray-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? 'text-primary-600' : 'text-gray-600'
                          }`}
                        >
                          {CATEGORY_LABELS[cat]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => updateFormData('tags', e.target.value)}
                  placeholder="例如: 可爱,粉色,樱花,春天"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-xl text-gray-800">
                打印设置
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="w-4 h-4 inline mr-1 text-mint-400" />
                    打印尺寸 *
                  </label>
                  <select
                    value={formData.printSize}
                    onChange={(e) => updateFormData('printSize', e.target.value as PrintSize)}
                    className="select-field"
                  >
                    {(Object.keys(PRINT_SIZE_LABELS) as PrintSize[]).map((size) => (
                      <option key={size} value={size}>
                        {PRINT_SIZE_LABELS[size]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="w-4 h-4 inline mr-1 text-lavender-400" />
                    色彩模式 *
                  </label>
                  <select
                    value={formData.colorMode}
                    onChange={(e) => updateFormData('colorMode', e.target.value as ColorMode)}
                    className="select-field"
                  >
                    {(Object.keys(COLOR_MODE_LABELS) as ColorMode[]).map((mode) => (
                      <option key={mode} value={mode}>
                        {COLOR_MODE_LABELS[mode]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    宽度 (mm) *
                  </label>
                  <input
                    type="number"
                    value={formData.widthMm}
                    onChange={(e) => updateFormData('widthMm', Number(e.target.value))}
                    min="10"
                    max="200"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    高度 (mm) *
                  </label>
                  <input
                    type="number"
                    value={formData.heightMm}
                    onChange={(e) => updateFormData('heightMm', Number(e.target.value))}
                    min="10"
                    max="280"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="p-4 bg-cream-50 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">尺寸提示</p>
                    <ul className="space-y-1">
                      <li>• 小尺寸：约 30mm，适合标注日期和小图标</li>
                      <li>• 中尺寸：40-50mm，适合一般装饰使用</li>
                      <li>• 大尺寸：60-80mm，适合作为主体装饰</li>
                      <li>• CMYK 模式适合专业印刷，RGB 适合屏幕显示</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Shield className="w-4 h-4 inline mr-1 text-amber-400" />
                  授权方式 *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.keys(LICENSE_TYPE_LABELS) as LicenseType[]).map((license) => {
                    const isSelected = formData.licenseType === license;
                    const descriptions = {
                      personal: '仅限个人手账使用，禁止商用',
                      commercial: '允许商业使用，可用于销售的产品',
                    };
                    return (
                      <button
                        key={license}
                        type="button"
                        onClick={() => updateFormData('licenseType', license)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-medium ${
                              isSelected ? 'text-primary-600' : 'text-gray-700'
                            }`}
                          >
                            {LICENSE_TYPE_LABELS[license]}
                          </span>
                          {isSelected && <Check className="w-5 h-5 text-primary-500" />}
                        </div>
                        <p className="text-xs text-gray-500">
                          {descriptions[license]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-xl text-gray-800">
                确认提交
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-cream-50">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="预览"
                        className="w-full h-full object-contain p-4"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {uploadedFile?.name}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">标题</p>
                      <p className="font-medium text-gray-800">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">分类</p>
                      <p className="font-medium text-gray-800">
                        {CATEGORY_LABELS[formData.category]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">尺寸</p>
                      <p className="font-medium text-gray-800">
                        {formData.widthMm} × {formData.heightMm} mm
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">打印尺寸</p>
                      <p className="font-medium text-gray-800">
                        {PRINT_SIZE_LABELS[formData.printSize]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">色彩模式</p>
                      <p className="font-medium text-gray-800">
                        {COLOR_MODE_LABELS[formData.colorMode]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">授权方式</p>
                      <p className="font-medium text-gray-800">
                        {LICENSE_TYPE_LABELS[formData.licenseType]}
                      </p>
                    </div>
                  </div>

                  {formData.description && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">描述</p>
                      <p className="text-gray-700">{formData.description}</p>
                    </div>
                  )}

                  {formData.tags && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">标签</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="tag bg-primary-50 text-primary-600"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                currentStep === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              上一步
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canProceed()}
                className={`btn-primary flex items-center gap-2 ${
                  !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                下一步
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    确认提交
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
