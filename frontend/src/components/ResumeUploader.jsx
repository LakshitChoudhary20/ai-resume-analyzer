import { useState, useRef } from 'react';

export default function ResumeUploader({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') setFile(f);
    else alert('Please upload a PDF file.');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!file) return alert('Please select a PDF resume.');
    onAnalyze(file, jd);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-sky-500 bg-sky-50' : 'border-gray-300 hover:border-sky-400 hover:bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <div>
            <div className="text-4xl mb-2">📄</div>
            <p className="font-semibold text-sky-700">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB — click to change</p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">⬆️</div>
            <p className="font-semibold text-gray-700">Drop your PDF resume here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse (max 5 MB)</p>
          </div>
        )}
      </div>

      {/* Job description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Description <span className="text-gray-400 font-normal">(optional — for matching %)</span>
        </label>
        <textarea
          className="input h-32 resize-none text-sm"
          placeholder="Paste the job description here to see how well your resume matches..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className="btn-primary w-full py-3 text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analyzing with AI...
          </span>
        ) : '🔍 Analyze Resume'}
      </button>
    </div>
  );
}
