"use client";

import { useState, useRef, useCallback } from "react";

const CHAR_LIMIT = 2000;

type Tone = "professional" | "warm" | "luxury";

interface FormData {
  address: string;
  price: string;
  sqft: string;
  bedrooms: string;
  bathrooms: string;
  halfBaths: string;
  garageStalls: string;
  garageSqft: string;
  lotSqft: string;
  appliances: string;
  constructionMaterials: string;
  roofAge: string;
  sellerFinancing: string;
  citySewerWater: string;
  propertyType: string;
  additionalNotes: string;
}

const initialForm: FormData = {
  address: "",
  price: "",
  sqft: "",
  bedrooms: "",
  bathrooms: "",
  halfBaths: "",
  garageStalls: "",
  garageSqft: "",
  lotSqft: "",
  appliances: "",
  constructionMaterials: "",
  roofAge: "",
  sellerFinancing: "",
  citySewerWater: "yes",
  propertyType: "previously-owned",
  additionalNotes: "",
};

export default function Home() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [tone, setTone] = useState<Tone>("warm");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = listing.length;
  const charColor =
    charCount > CHAR_LIMIT
      ? "text-red-500"
      : charCount > CHAR_LIMIT * 0.85
      ? "text-amber-500"
      : "text-emerald-500";

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    setPhotos((prev) => [...prev, ...newFiles].slice(0, 12));
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews((prev) =>
          [...prev, e.target?.result as string].slice(0, 12)
        );
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleGenerate = async () => {
    if (!form.address || !form.price) {
      setError("Address and price are required.");
      return;
    }
    setError("");
    setLoading(true);
    setListing("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("tone", tone);
      photos.forEach((photo) => fd.append("photos", photo));

      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation failed");
      setListing(data.listing);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(listing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toneOptions: { value: Tone; label: string; desc: string }[] = [
    {
      value: "professional",
      label: "Professional",
      desc: "Clean, factual, trustworthy",
    },
    {
      value: "warm",
      label: "Warm & Inviting",
      desc: "Lifestyle-focused, emotional",
    },
    { value: "luxury", label: "Luxury", desc: "Premium, aspirational, elite" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">ListingCraft</h1>
              <p className="text-xs text-slate-400">MLS Listing Generator</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            Northstar MLS · 2,000 chars
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Photos + Details =<br />
            <span className="text-blue-600">Polished MLS Listing</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Upload property photos, fill in the specs, and get a professionally
            written listing description in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Property Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
                Property Details
              </h3>

              {/* Address + Price */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleInput}
                    placeholder="123 Maple Street, Minneapolis, MN 55401"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Listing Price <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleInput}
                    placeholder="$425,000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Grid fields */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { name: "sqft", label: "Living Sq Ft", placeholder: "2,400" },
                  { name: "bedrooms", label: "Bedrooms", placeholder: "4" },
                  { name: "bathrooms", label: "Full Baths", placeholder: "2" },
                  { name: "halfBaths", label: "Half Baths", placeholder: "1" },
                  { name: "garageStalls", label: "Garage Stalls", placeholder: "2" },
                  { name: "garageSqft", label: "Garage Sq Ft", placeholder: "480" },
                  { name: "lotSqft", label: "Lot Sq Ft", placeholder: "10,890" },
                  { name: "roofAge", label: "Roof Age", placeholder: "5 years" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      value={form[field.name as keyof FormData]}
                      onChange={handleInput}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
                    />
                  </div>
                ))}
              </div>

              {/* Select fields */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    City Sewer & Water
                  </label>
                  <select
                    name="citySewerWater"
                    value={form.citySewerWater}
                    onChange={handleInput}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="yes">Yes — City</option>
                    <option value="well-septic">Well & Septic</option>
                    <option value="city-sewer-well">City Sewer / Well</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleInput}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="previously-owned">Previously Owned</option>
                    <option value="new-construction">New Construction</option>
                  </select>
                </div>
              </div>

              {/* Text areas */}
              <div className="space-y-4">
                {[
                  {
                    name: "appliances",
                    label: "Included Appliances",
                    placeholder: "Refrigerator, stove, dishwasher, washer/dryer...",
                  },
                  {
                    name: "constructionMaterials",
                    label: "Construction Materials",
                    placeholder: "Vinyl siding, brick front, hardwood floors, granite counters...",
                  },
                  {
                    name: "sellerFinancing",
                    label: "Seller Financing Terms",
                    placeholder: "Conventional, FHA, VA, cash accepted... or leave blank",
                  },
                  {
                    name: "additionalNotes",
                    label: "Additional Notes / Highlights",
                    placeholder: "Cul-de-sac lot, new HVAC 2023, finished basement, pool, near top-rated schools...",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {field.label}
                    </label>
                    <textarea
                      name={field.name}
                      value={form[field.name as keyof FormData]}
                      onChange={handleInput}
                      placeholder={field.placeholder}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Photos + Tone + Generate */}
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
                Property Photos
              </h3>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Drop photos here or{" "}
                      <span className="text-blue-600">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Up to 12 photos · JPG, PNG, WEBP
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {/* Photo thumbnails */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative group aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(i);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tone Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Listing Tone
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      tone === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-0.5 ${tone === option.value ? "text-blue-700" : "text-slate-700"}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-slate-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-2xl py-4 px-6 text-base shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Crafting your listing…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Listing
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* OUTPUT */}
        {listing && (
          <div className="mt-10">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Output header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-sm font-semibold text-slate-700">
                    Generated Listing
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-mono font-medium ${charColor}`}>
                    {charCount.toLocaleString()} / {CHAR_LIMIT.toLocaleString()} chars
                  </span>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`text-sm font-medium rounded-xl px-4 py-1.5 flex items-center gap-2 transition-all ${
                      copied
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy to Clipboard
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated text */}
              <div className="p-6">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {listing}
                </p>
              </div>

              {/* Character bar */}
              <div className="px-6 pb-6">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      charCount > CHAR_LIMIT
                        ? "bg-red-400"
                        : charCount > CHAR_LIMIT * 0.85
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                    style={{
                      width: `${Math.min(100, (charCount / CHAR_LIMIT) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-300">
        ListingCraft · Built for Northstar MLS agents
      </footer>
    </div>
  );
}
