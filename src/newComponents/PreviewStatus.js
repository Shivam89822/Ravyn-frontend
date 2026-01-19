import React, { useState, useRef, useEffect } from "react";
import "./PreviewStatus.css";
import { Rnd } from "react-rnd";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Type,
  Palette,
  PaintBucket,
  Music,
  SlidersHorizontal,
  X
} from "lucide-react";
import Loader from "../Components/Loader";

function PreviewStatus({statusRef, status, setStatus}) {
  const [draftText, setDraftText] = useState("");
  const [activeElement, setActiveElement] = useState(null);
  const [elements, setElements] = useState([]);
  const [activetab, setActiveTab] = useState("text");
  const [colorVal, setColorVal] = useState("#000000");
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(5); // Stored as percentage of container width
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [mainBackgroud, setMainBackgroud] = useState("#000000");
  const [isLoader, setIsLoader] = useState(false);
  
  const containerRef = useRef(null);
  const user = useSelector((state) => state.user.user);

  const [box, setBox] = useState({
    x: 0,
    y: 0,
    width: 180,
    height: 60
  });

  const isVideo = status?.type?.startsWith("video");
  const isImage = status?.type?.startsWith("image");

  const addStatus = async () => {
    setIsLoader(true);
    const data = { backgroundColor: mainBackgroud };
    const profile = statusRef.current?.files[0];

    if (profile) {
      const formData = new FormData();
      formData.append("file", profile);
      formData.append("upload_preset", "shivam_products");

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dksrg9oqk/auto/upload",
          formData
        );

        data.mediaUrl = response.data.secure_url;
        data.mediaPublicId = response.data.public_id;
        data.type = isImage ? "image" : "video";
      } catch (e) {
        console.error(e);
        alert("Error uploading to Cloudinary");
        setIsLoader(false);
        return;
      }
    }

    try {
      await axios.post("http://localhost:8080/api/status/post", {
        userId: user._id,
        elements: elements,
        data: data,
      });
      console.log("status saved ✅");
      setStatus(null); // Close preview after success
    } catch (e) {
      alert(e.response?.data?.message || "Internal Server Error");
    } finally {
      setIsLoader(false);
    }
  };

  const handleEditExisting = (index) => {
    const target = elements[index];
    const container = containerRef.current;
    if (!container) return;

    if (activeElement) {
      saveActiveElement();
    }

    setActiveElement({ content: target.content });
    setBox({
      x: target.x * container.offsetWidth,
      y: target.y * container.offsetHeight,
      width: target.width * container.offsetWidth,
      height: target.height * container.offsetHeight
    });
    
    setOpacity(target.opacity);
    setColorVal(target.style.background);
    setFontSize(target.style.fontSizeRatio * 100);
    setFontFamily(target.style.fontFamily);

    setElements(prev => prev.filter((_, i) => i !== index));
  };

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const saveActiveElement = () => {
    const container = containerRef.current;
    if (activeElement && container) {
      setElements(prev => [
      ...prev,
      {
        type: "text",
        content: activeElement.content,
        x: box.x / container.offsetWidth,
        y: box.y / container.offsetHeight,
        width: box.width / container.offsetWidth,
        height: box.height / container.offsetHeight,
        opacity: opacity,
        style: { 
          background: colorVal, 
          fontSizeRatio: fontSize / 100, 
          fontFamily: fontFamily 
        }
      }
    ]);

      setActiveElement(null);
    }
  };

  const handleAddText = () => {
    if (!draftText && !activeElement) return;

    if (activeElement) {
      saveActiveElement();
    } else {
      const container = containerRef.current;
      const newWidth = 180;
      const newHeight = 60;
      const centerX = container ? (container.offsetWidth / 2) - (newWidth / 2) : 100;
      const centerY = container ? (container.offsetHeight / 2) - (newHeight / 2) : 200;

      setActiveElement({ content: draftText });
      setBox({ x: centerX, y: centerY, width: newWidth, height: newHeight });
    }
    setDraftText("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeElement && containerRef.current && containerRef.current.contains(event.target)) {
        const isRnd = event.target.closest(".react-draggable");
        if (!isRnd) {
          saveActiveElement();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeElement, box, opacity, colorVal, fontSize, fontFamily]);

  return (
    <div className="status-preview-overlay">
      <div className="status-preview-item">
        <div className={activetab === "text" ? "active tab-holder" : "tab-holder"} onClick={() => setActiveTab("text")}>
          <Type size={24} />
        </div>
        <div className={activetab === "textcolor" ? "active tab-holder" : "tab-holder"} onClick={() => setActiveTab("textcolor")}>
          <Palette size={24} />
        </div>
        <div className={activetab === "background" ? "active tab-holder" : "tab-holder"} onClick={() => setActiveTab("background")}>
          <PaintBucket size={24} />
        </div>
        <div className={activetab === "music" ? "active tab-holder" : "tab-holder"} onClick={() => setActiveTab("music")}>
          <Music size={24} />
        </div>
        <div className={activetab === "setting" ? "active tab-holder" : "tab-holder"} onClick={() => setActiveTab("setting")}>
          <SlidersHorizontal size={24} />
        </div>
      </div>

      <div className="status-preview-item reel-container" ref={containerRef} style={{ position: 'relative', overflow: 'hidden', backgroundColor: `${mainBackgroud}` }}>
        {isImage && <img className="status-preview-reel" src={status.url} alt="status" />}
        {isVideo && (
          <video className="status-preview-reel" src={status.url} autoPlay muted loop playsInline />
        )}

        {containerRef.current && elements.map((el, index) => (
          <div
            key={index}
            className="text-overlay"
            onClick={() => handleEditExisting(index)}
            style={{
              position: "absolute",
              left: `${el.x * 100}%`,
              top: `${el.y * 100}%`,
              width: `${el.width * 100}%`,
              height: `${el.height * 100}%`,
              zIndex: 1,
              cursor: "pointer",
              fontSize: `${el.style.fontSizeRatio * containerRef.current.offsetWidth}px`,
              backgroundColor: `${hexToRgba(el.style.background, el.opacity)}`,
              fontFamily: `${el.style.fontFamily}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              wordBreak: 'break-word'
            }}
          >
            {el.content}
          </div>
        ))}

        {activeElement && containerRef.current && (
          <Rnd
            bounds="parent"
            style={{ zIndex: 10, backgroundColor: `${hexToRgba(colorVal, opacity)}` }}
            size={{ width: box.width, height: box.height }}
            position={{ x: box.x, y: box.y }}
            onDragStop={(e, d) => setBox(prev => ({ ...prev, x: d.x, y: d.y }))}
            onResizeStop={(e, dir, ref, delta, pos) =>
              setBox({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: pos.x,
                y: pos.y
              })
            }
          >
            <div
              className="text-overlay active-item"
              style={{
                border: '2px dashed #fff',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.2)',
                fontSize: `${(fontSize / 100) * containerRef.current.offsetWidth}px`,
                fontFamily: `${fontFamily}`,
                textAlign: 'center',
                wordBreak: 'break-word'
              }}
            >
              {activeElement.content}
            </div>
          </Rnd>
        )}
      </div>

      <div className="status-preview-item editor-box">
        {activetab == "text" && <div className="changeble-box">
          <div className="text-cross">
            <div>{activeElement ? "Adjust Text" : "Add Text"}</div>
            <X size={28} style={{ cursor: 'pointer' }} onClick={() => { setActiveElement(null); setDraftText(""); }} />
          </div>
          <div className="textarea-holder">
            <textarea
              placeholder="Type something..."
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
            />
          </div>
          <div className="add-text-btn">
            <button onClick={handleAddText}>
              {activeElement ? "Save Changes" : "Add Text"}
            </button>
          </div>
        </div>}

        {activetab == "textcolor" && (
          <div>
            <div className="text-cross">
              <div>Add Color</div>
              <X size={28} style={{ cursor: 'pointer' }} onClick={() => { setActiveElement(null); setDraftText(""); }} />
            </div>
            <div className="color-box-holder">
              {["#FFFFFF", "#FF1493", "#FFD700", "#00FF00", "#00BFFF", "#FF6347", "#9370DB", "#FF69B4", "#FFA500", "#32CD32", "#87CEEB", "#000000"].map(color => (
                <div 
                  key={color}
                  onClick={() => setColorVal(color)} 
                  className={colorVal === color ? "color-style-box1 activeColor" : "color-style-box1"} 
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div>
              <input value={colorVal} onChange={(e) => setColorVal(e.target.value)} className="color-input" type="color" />
            </div>
            <div className="range-holder">
              <label>Opacity</label>
              <input value={opacity} step={0.01} onChange={(e) => setOpacity(e.target.value)} max={1} min={0} className="range-input" type="range" />
            </div>
            <div className="range-holder">
              <label>Font Size (%)</label>
              <input value={fontSize} step={0.1} onChange={(e) => setFontSize(e.target.value)} max={30} min={1} className="range-input" type="range" />
            </div>
            <div className="font-control">
              <label className="font-label">Font Family</label>
              <select className="font-family-select" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
                <option value="'Times New Roman', Times, serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', Courier, monospace">Courier New</option>
                <option value="Verdana, Geneva, sans-serif">Verdana</option>
                <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                <option value="'Trebuchet MS', Helvetica, sans-serif">Trebuchet MS</option>
                <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
                <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans MS</option>
              </select>
            </div>
          </div>
        )}

        {activetab == "background" && (
          <div>
            <div className="text-cross">
              <div>Background Color</div>
              <X size={28} style={{ cursor: 'pointer' }} onClick={() => { setActiveElement(null); setDraftText(""); }} />
            </div>
            <div className="color-box-holder">
              {["#FFFFFF", "#FF1493", "#FFD700", "#00FF00", "#00BFFF", "#FF6347", "#9370DB", "#FF69B4", "#FFA500", "#32CD32", "#87CEEB", "#000000"].map(color => (
                <div 
                  key={color}
                  onClick={() => setMainBackgroud(color)} 
                  className={mainBackgroud === color ? "color-style-box1 activeColor" : "color-style-box1"} 
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div>
              <input value={mainBackgroud} onChange={(e) => setMainBackgroud(e.target.value)} className="color-input" type="color" />
            </div>
          </div>
        )}

        <div className="bottom-main-box">
          <button className="share-btn" onClick={addStatus}>Share</button>
          <button className="close2-btn" onClick={() => setStatus(null)}>Close</button>
        </div>
      </div>
      {isLoader && <Loader />}
    </div>
  );
}

export default PreviewStatus;