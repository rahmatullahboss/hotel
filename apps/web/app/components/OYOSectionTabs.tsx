"use client";

import { useRef, useEffect, useState } from "react";
import { FiShare2 } from "react-icons/fi";

interface OYOSectionTabsProps {
    sections: { id: string; label: string }[];
    activeSection?: string;
    onSectionClick?: (sectionId: string) => void;
}

export function OYOSectionTabs({ sections, activeSection, onSectionClick }: OYOSectionTabsProps) {
    const [active, setActive] = useState(activeSection || sections[0]?.id);
    const tabsRef = useRef<HTMLDivElement>(null);

    const handleClick = (sectionId: string) => {
        setActive(sectionId);
        onSectionClick?.(sectionId);

        // Scroll to section
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="oyo-section-tabs">
            <div className="oyo-tabs-inner" ref={tabsRef}>
                {sections.map((section) => (
                    <button
                        key={section.id}
                        className={`oyo-tab ${active === section.id ? "active" : ""}`}
                        onClick={() => handleClick(section.id)}
                    >
                        {section.label}
                    </button>
                ))}
            </div>
            <button className="oyo-share-btn">
                <FiShare2 size={16} />
                Share
            </button>
        </div>
    );
}
