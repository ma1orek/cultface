import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const scenes = [
    {
        name: 'Meet Joe Black (1998)',
        actor: 'Brad Pitt',
        videoUrl: '/Brad Pitt.mp4',
        imageUrl: '/Brad Pitt.jpg',
    },
    {
        name: "Bridget Jones's Diary (2001)",
        actor: 'Renée Zellweger',
        videoUrl: '/Renee Zellweger.mp4',
        imageUrl: '/Renee Zellweger.jpg',
    },
    {
        name: 'The Wolf of Wall Street (2013)',
        actor: 'Leonardo DiCaprio',
        videoUrl: '/Leonardo DiCaprio.mp4',
        imageUrl: '/Leonardo DiCaprio.jpg',
    },
    {
        name: 'The Godfather (1972)',
        actor: 'Marlon Brando',
        videoUrl: '/Marlon Brando.mp4',
        imageUrl: '/Marlon Brando.jpg',
    },
    {
        name: 'Forrest Gump (1994)',
        actor: 'Tom Hanks',
        videoUrl: '/Forrest Gump.mp4',
        imageUrl: '/Forrest Gump.jpg',
    },
    {
        name: 'Lucy (2014)',
        actor: 'Scarlett Johansson',
        videoUrl: '/Scarlett Johansson.mp4',
        imageUrl: '/Scarlett Johansson.jpg',
    },
    {
        name: 'The Shining (1980)',
        actor: 'Jack Nicholson',
        videoUrl: '/Jack Nicholson.mp4',
        imageUrl: '/Jack Nicholson.jpg',
    },
    {
        name: 'Pulp Fiction (1994)',
        actor: 'Samuel L. Jackson',
        videoUrl: '/Samuel L Jackson.mp4',
        imageUrl: '/Samuel L Jackson.jpg',
    },
    {
        name: 'Braveheart (1995)',
        actor: 'Mel Gibson',
        videoUrl: '/Mel Gibson.mp4',
        imageUrl: '/Mel Gibson.jpg',
    },
    {
        name: 'The Dark Knight (2008)',
        actor: 'Heath Ledger',
        videoUrl: '/Heath Ledger.mp4',
        imageUrl: '/Heath Ledger.jpg',
    },
    {
        name: 'Blinded By The Lights (2018)',
        actor: 'Jan Frycz',
        videoUrl: '/Jan Frycz.mp4',
        imageUrl: '/Jan Frycz.jpg',
    },
    {
        name: 'Iron Man 2 (2010)',
        actor: 'Robert Downey Jr.',
        videoUrl: '/Robert Downey Jr.mp4',
        imageUrl: '/Robert Downey Jr.jpg',
    },
    {
        name: 'Spider Man 2 (2004)',
        actor: 'Tobey Maguire',
        videoUrl: '/Tobey Maguire.mp4',
        imageUrl: '/Tobey Maguire.jpg',
    },
    {
        name: 'Bruce Almighty (2003)',
        actor: 'Steve Carell',
        videoUrl: '/Steve Carell.mp4',
        imageUrl: '/Steve Carell.jpg',
    },
];

export default function CultFace() {
    const [selectedScene, setSelectedScene] = useState(scenes[0]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const videoRef = useRef(null);
    const shineSectionRef = useRef(null);

    const handleFileChange = (event) => {
        setUploadedFile(event.target.files[0]);
    };

    const handleSceneClick = (scene) => {
        if (selectedScene?.name !== scene.name) {
            setIsVideoLoading(true);
            setSelectedScene(scene);
            setCustomUrl('');
        }
    };
    
    const handleScrollToShine = () => {
        shineSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCustomUrlChange = (event) => {
        const url = event.target.value;
        setCustomUrl(url);
        setIsVideoLoading(true);

        if (url) {
            setSelectedScene(null);
        } else {
            setSelectedScene(scenes[0]);
        }
    };

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
    });

    const handleGenerateClick = async () => {
        if (!uploadedFile) {
            alert('Please upload your face portrait first!');
            return;
        }

        let videoUrlToGenerate = customUrl || selectedScene?.videoUrl;
        if (!videoUrlToGenerate) {
            alert('Please select a scene or provide a video URL!');
            return;
        }

        // If the URL is a local path, construct the absolute URL for the API
        if (videoUrlToGenerate.startsWith('/')) {
            videoUrlToGenerate = `${window.location.origin}${videoUrlToGenerate}`;
        }

        setIsGenerating(true);

        try {
            const sourceBase64 = await toBase64(uploadedFile);

            const response = await fetch('/api/face-swap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceBase64,
                    videoUrl: videoUrlToGenerate
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    // If it's not JSON, the original text is the best we have.
                }
                throw new Error(errorMessage);
            }

            const videoBlob = await response.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            
            setGeneratedVideoUrl(videoUrl);
            setShowResultModal(true);

        } catch (error) {
            console.error('Generation failed:', error);
            if (error.message.includes('504') || error.message.includes('Gateway Timeout')) {
                 alert('Error: The server took too long to respond. This can happen with long videos or high server load. Please try again in a moment or use a shorter video clip.');
            } else {
                 alert(`Error: ${error.message}`);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const closeModal = () => {
        setShowResultModal(false);
        setGeneratedVideoUrl('');
    };

    const handleDownload = () => {
        if (!generatedVideoUrl) return;
        const a = document.createElement('a');
        a.href = generatedVideoUrl;
        a.download = 'cultface-masterpiece.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleShare = async () => {
        const shareData = {
            title: 'CULTFACE',
            text: 'Check out the iconic movie scene I starred in!',
            url: 'https://www.cultface.me',
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
            console.error("Couldn't share using Web Share API:", err);
            // Fallback: Copy link to clipboard
            navigator.clipboard.writeText(shareData.url).then(() => {
                alert('Link to the website has been copied to your clipboard!');
            }).catch(err => {
                console.error('Failed to copy link:', err);
                alert('Could not copy link to clipboard.');
            });
        }
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            const handleCanPlay = () => setIsVideoLoading(false);
            
            setIsVideoLoading(true);

            videoElement.addEventListener('canplay', handleCanPlay);

            if (videoElement.readyState >= 3) {
                handleCanPlay();
            }
            
            return () => {
                videoElement.removeEventListener('canplay', handleCanPlay);
            };
        }
    }, [customUrl, selectedScene]); 

    const currentVideoUrl = customUrl || selectedScene?.videoUrl;

    return (
        <>
            <Head>
                <title>cultface - put yourself in the middle of iconic movie scenes - AI powered</title>
                <link rel="icon" href="/favi.png?v=3" />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="main-wrapper">
                <main className="container">
                    <nav className="navbar">
                        <img src="/cultface.svg" alt="Cultface Logo" className="logo" />
                    </nav>

                    <header className="hero-section">
                        <div className="hero-text">
                            <h1>Take Part in <span className="brand-color">Iconic</span><br />Movie Moments</h1>
                            <p>Step into favorite movie moments and swap the actor's face for your own.</p>
                            <button className="btn-cta" onClick={handleScrollToShine}>Become famous &rarr;</button>
                        </div>
                        <div className="hero-image">
                            <img src="https://bnbdogcmflenioju.public.blob.vercel-storage.com/Hero.gif" alt="Face swap hero" />
                        </div>
                    </header>
                    
                    <div className="shine-separator" ref={shineSectionRef}>
                        <img src="/bgww.svg" alt="separator" className="shine-bg" />
                        <h2>This is your time to <span className="brand-color">shine</span></h2>
                    </div>
                    
                     <section className="interaction-section">
                        <div className="step">
                            <h3 className="step-title"><span className="step-number brand-color">1</span> Choose your scene</h3>
                            <div className="scene-scroll-wrapper">
                                <div className="scene-scroll-container">
                                    <div className="scene-grid">
                                        {scenes.map((scene) => (
                                            <div key={scene.name} className={`scene-card ${selectedScene?.name === scene.name ? 'active' : ''}`} onClick={() => handleSceneClick(scene)}>
                                                <div className="scene-thumbnail">
                                                    <Image
                                                        src={scene.imageUrl}
                                                        alt={scene.name}
                                                        layout="fill"
                                                        objectFit="cover"
                                                    />
                                                </div>
                                                <div className="scene-title-wrapper">
                                                    <div className="scene-title"><strong>{scene.name}</strong></div>
                                                    <div className="scene-actor">{scene.actor}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="video-preview-container">
                                {isVideoLoading && (
                                    <div className="loader-container">
                                        <div className="spinner"></div>
                                    </div>
                                )}
                                <video 
                                    ref={videoRef} 
                                    key={currentVideoUrl}
                                    controls 
                                    autoPlay 
                                    loop 
                                    muted={false} 
                                    className="main-video" 
                                    poster={selectedScene?.imageUrl || ''}
                                    style={{ visibility: isVideoLoading ? 'hidden' : 'visible' }}
                                >
                                    {currentVideoUrl &&
                                        <source src={currentVideoUrl} type="video/mp4" />
                                    }
                                </video>
                            </div>
                            <div className={`custom-scene-input ${customUrl ? 'active' : ''}`}>
                                <input 
                                    type="text" 
                                    placeholder="You want different scene? Just paste here direct link to your .mp4" 
                                    value={customUrl}
                                    onChange={handleCustomUrlChange}
                                />
                                <i className="ri-links-line"></i>
                            </div>
                        </div>

                        <div className="step">
                            <h3 className="step-title"><span className="step-number brand-color">2</span> Upload your face</h3>
                            <div className="upload-area">
                                <input type="file" id="file-upload" onChange={handleFileChange} accept="image/jpeg, image/png" style={{ display: 'none' }} />
                                <label htmlFor="file-upload" className="upload-label">
                                    <div className="upload-icon">
                                        <i className="ri-user-smile-line"></i>
                                    </div>
                                    <div className="upload-text">
                                        Choose file or drag & drop your portrait (JPEG/PNG)
                                        {uploadedFile && <span className="file-name">{uploadedFile.name}</span>}
                                    </div>
                                    <div className="upload-graphic">
                                        <i className="ri-upload-2-line"></i>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="generate-button-container">
                            <button className="btn-generate" onClick={handleGenerateClick} disabled={isGenerating}>
                                {isGenerating ? (
                                    <span>Generating<span className="dots">...</span></span>
                                ) : (
                                    "I'm ready, make the dream come true →"
                                )}
                            </button>
                            <p>Depending on how long the video is - generation takes ~30 - 90 seconds</p>
                        </div>
                    </section>
                    
                    <section className="facts-section">
                        <div className="fact">
                            <i className="ri-layout-3-line"></i>
                            <h4>First-of-its-kind</h4>
                            <p>CULTFACE is the nation's first tool to perform real-time face swaps in cinematic clips directly in the browser—no downloads or installs required.</p>
                        </div>
                        <div className="fact">
                            <i className="ri-brain-line"></i>
                            <h4>Powered by AI Processing</h4>
                            <p>Our engine analyzes hundreds of facial landmarks to ensure seamless, natural-looking swaps even when actors move, emote, or change lighting.</p>
                        </div>
                        <div className="fact">
                            <i className="ri-archive-drawer-line"></i>
                            <h4>Built-in Iconic Library</h4>
                            <p>At launch you'll find legendary scenes—from The Matrix to Pulp Fiction—and you can expand the collection anytime by uploading your own clips.</p>
                        </div>
                    </section>
                </main>
                <footer className="footer-section">
                    <img src="/cultface.svg" alt="Cultface Logo" className="logo" />
                    <p>© 2025 cultface. Powered by Bartosz Idzik</p>
                </footer>

                {showResultModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-button" onClick={closeModal}>&times;</button>
                            <h3>Your masterpiece is ready!</h3>
                            <video src={generatedVideoUrl} controls autoPlay loop className="result-video"></video>
                            <div className="modal-actions">
                                <button className="btn-download" onClick={handleDownload}><i className="ri-download-2-line"></i> Download</button>
                                <button className="btn-share" onClick={handleShare}><i className="ri-share-line"></i> Share</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                :root {
                    --brand-color: #E7F0AA;
                    --background-color: #0d0c0f;
                    --text-color: #ffffff;
                    --secondary-text-color: #aaaaaa;
                    --border-color: #333333;
                    --input-bg-color: #1a1a1a;
                }
                 *, *::before, *::after {
                    box-sizing: border-box;
                }
                body {
                    background-color: var(--background-color);
                    color: var(--text-color);
                    font-family: 'Montserrat', sans-serif;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }
                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: 
                        radial-gradient(circle at 15% 25%, rgba(231, 240, 170, 0.08), transparent 25%),
                        radial-gradient(circle at 85% 75%, rgba(231, 240, 170, 0.05), transparent 30%);
                    z-index: -1;
                    animation: moveLights 20s ease-in-out infinite alternate;
                    filter: blur(60px);
                }

                @keyframes moveLights {
                    from { 
                        transform: translate(0, 0) rotate(0deg) scale(1); 
                    }
                    to { 
                        transform: translate(200px, -150px) rotate(25deg) scale(1.1); 
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes dots {
                    0%, 20% { content: '.'; }
                    40% { content: '..'; }
                    60%, 100% { content: '...'; }
                }
            `}</style>
            <style jsx>{`
                 .container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    padding: 0 20px; 
                }
                .navbar { padding: 40px 0; }
                .logo { height: 30px; }

                .brand-color { color: var(--brand-color); }

                .hero-section {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 40px 0;
                    gap: 40px;
                }
                .hero-text h1 {
                    font-size: 3.5rem;
                    font-weight: 700;
                    line-height: 1.1;
                    margin-bottom: 20px;
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .hero-text p {
                    font-size: 1.1rem;
                    color: var(--secondary-text-color);
                    margin-bottom: 30px;
                    animation: fadeInUp 0.8s ease-out 0.2s forwards;
                    opacity: 0; /* Start hidden for animation */
                }
                .btn-cta {
                    background: transparent;
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                    padding: 14px 30px; /* Increased size */
                    font-size: 1.1rem; /* Increased size */
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    animation: fadeInUp 0.8s ease-out 0.4s forwards;
                    opacity: 0; /* Start hidden for animation */
                }
                .btn-cta:hover { 
                    background: var(--text-color); 
                    color: var(--background-color); 
                    border-color: var(--text-color);
                }
                .hero-image img { width: 100%; max-width: 550px; border-radius: 15px; }
                
                .shine-separator {
                    text-align: center;
                    margin: 100px 0;
                    position: relative;
                }
                .shine-separator h2 { 
                    font-size: 2.5rem; 
                    font-weight: 700; 
                    position: relative;
                    z-index: 1;
                }
                .shine-bg {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: auto;
                    height: 150px;
                    opacity: 0.1;
                    z-index: 0;
                }

                .step { margin-bottom: 80px; }
                .step-title {
                    font-size: 1.5rem;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                }
                .step-number { font-weight: 700; margin-right: 15px; }
                
                .scene-scroll-wrapper {
                    position: relative;
                }

                .scene-scroll-wrapper::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: -1px;
                    width: 100px;
                    height: 100%;
                    background: linear-gradient(to left, var(--background-color) 40%, transparent);
                    pointer-events: none;
                    z-index: 2;
                }

                .scene-scroll-container {
                    overflow-x: auto;
                    scrollbar-width: thin;
                    scrollbar-color: var(--brand-color) #000000;
                }
                
                .scene-scroll-container::-webkit-scrollbar {
                    height: 8px;
                }

                .scene-scroll-container::-webkit-scrollbar-track {
                    background: #000000;
                    border-radius: 4px;
                }

                .scene-scroll-container::-webkit-scrollbar-thumb {
                    background-color: var(--brand-color);
                    border-radius: 4px;
                }

                .scene-grid {
                    display: grid;
                    grid-auto-flow: column;
                    grid-template-rows: repeat(2, 1fr);
                    grid-auto-columns: 280px;
                    gap: 25px;
                    padding: 5px 105px 20px 5px;
                }

                .scene-card {
                    background: var(--input-bg-color);
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                    position: relative;
                    aspect-ratio: 16/9;
                }
                .scene-card:hover {
                    border-color: var(--secondary-text-color);
                }
                .scene-card.active {
                    border-color: var(--brand-color);
                    box-shadow: 0 0 15px rgba(231,240,170,0.2);
                }
                .scene-thumbnail {
                    position: relative;
                    width: 100%;
                    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
                    border-radius: 8px;
                    overflow: hidden; /* Ensures the inner Image component respects the border-radius */
                    transition: transform 0.3s ease;
                    background-color: #1a1a1a; /* Placeholder color */
                }
                .scene-title-wrapper {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                    padding: 20px 15px 15px;
                }
                .scene-title {
                    font-weight: 500;
                    font-size: 0.9rem;
                    text-align: center;
                }
                .scene-actor {
                    font-size: 0.8rem;
                    color: var(--secondary-text-color);
                    text-align: center;
                    margin-top: 4px;
                }

                .video-preview-container {
                    margin-top: 40px;
                    width: 100%;
                    background: #000000;
                    border-radius: 12px;
                    position: relative;
                }
                .loader-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #000;
                    border-radius: 12px;
                }
                .spinner {
                    border: 4px solid rgba(255, 255, 255, 0.2);
                    border-left-color: var(--brand-color);
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                }
                .main-video { 
                    width: 100%; 
                    height: auto;
                    border-radius: 12px; 
                    display: block;
                }

                .custom-scene-input { position: relative; margin-top: 20px; }
                .custom-scene-input.active input {
                    border-color: var(--brand-color);
                    box-shadow: 0 0 15px rgba(231,240,170,0.2);
                }
                .custom-scene-input input {
                    width: 100%;
                    background: var(--input-bg-color);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 18px 50px 18px 20px;
                    color: var(--text-color);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                .custom-scene-input i {
                    position: absolute;
                    right: 20px; top: 50%;
                    transform: translateY(-50%);
                    color: var(--secondary-text-color);
                    pointer-events: none;
                }

                .upload-area {
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                }
                .upload-area:hover { border-color: var(--secondary-text-color); }
                .upload-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    cursor: pointer;
                    gap: 15px;
                }
                .upload-icon { font-size: 2.5rem; color: var(--secondary-text-color); }
                .upload-text { color: #cccccc; }
                .upload-text .file-name { color: var(--brand-color); display: block; margin-top: 10px; }
                .upload-graphic { font-size: 2rem; color: var(--secondary-text-color); }

                .generate-button-container { text-align: center; margin-top: 60px; }
                .btn-generate {
                    background: transparent;
                    color: var(--brand-color);
                    border: 1px solid var(--brand-color);
                    padding: 18px 40px;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 15px;
                    position: relative;
                }
                .btn-generate:hover:not(:disabled) { 
                    background: var(--brand-color);
                    color: var(--background-color);
                }
                .btn-generate:disabled {
                    cursor: not-allowed;
                    color: var(--secondary-text-color);
                    border-color: var(--border-color);
                }
                .dots::after {
                    content: '...';
                    animation: dots 1.5s linear infinite;
                    display: inline-block;
                    width: 1em;
                    text-align: left;
                }
                .generate-button-container p { color: var(--secondary-text-color); font-size: 0.9rem; }

                .facts-section {
                    padding: 100px 0;
                    display: flex;
                    justify-content: space-between;
                    gap: 40px;
                    text-align: center;
                }
                .fact { max-width: 320px; }
                .fact i { font-size: 2.5rem; color: var(--brand-color); margin-bottom: 20px; }
                .fact h4 { font-size: 1.25rem; margin-bottom: 15px; font-weight: 700; }
                .fact p { color: var(--secondary-text-color); line-height: 1.6; }

                .footer-section {
                    padding: 60px 0;
                    text-align: center;
                    border-top: 1px solid #222222;
                }
                .footer-section .logo { height: 25px; margin-bottom: 15px; }
                .footer-section p { color: var(--secondary-text-color); }
                
                /* Responsive Styles */
                @media (max-width: 992px) {
                    .hero-section {
                        flex-direction: column;
                        text-align: center;
                    }
                    .hero-text {
                        max-width: 100%;
                    }
                    .facts-section {
                        flex-direction: column;
                        align-items: center;
                    }
                }
                @media (max-width: 768px) {
                    .hero-text h1 {
                        font-size: 2.5rem;
                    }
                    .shine-separator h2 {
                        font-size: 2rem;
                    }
                    .upload-label {
                        flex-direction: column;
                        text-align: center;
                    }
                    .upload-graphic { display: none; }
                    .scene-grid {
                        grid-template-rows: 1fr;
                        grid-auto-columns: 240px;
                    }
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    background-color: var(--background-color);
                    padding: 40px;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 800px;
                    position: relative;
                    border: 1px solid var(--border-color);
                    text-align: center;
                }
                .modal-content h3 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-size: 1.5rem;
                }
                .close-button {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    color: var(--secondary-text-color);
                    font-size: 2.5rem;
                    cursor: pointer;
                }
                .result-video {
                    width: 100%;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }
                .modal-actions {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 20px;
                }
                .btn-download, .btn-share {
                    background-color: var(--brand-color);
                    color: var(--background-color);
                    border: none;
                    padding: 12px 25px;
                    font-size: 1rem;
                    font-weight: 500;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-download:hover, .btn-share:hover {
                    background-color: #d8e090;
                }
                .btn-share {
                    background-color: #2a2a2a;
                    color: var(--text-color);
                }
                .btn-share:hover {
                    background-color: #3a3a3a;
                }
            `}</style>
        </>
    );
}
