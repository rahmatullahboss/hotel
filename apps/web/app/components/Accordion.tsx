"use client";

import { useState, ReactNode } from "react";
import { HiChevronDown } from "react-icons/hi2";

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
  className?: string;
}

// Accordion Container
export function Accordion({ children, className = "" }: AccordionProps) {
  return (
    <div className={`divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// Accordion Item
export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <HiChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// FAQ specific component
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  className?: string;
}

export function FAQ({ items, className = "" }: FAQProps) {
  return (
    <Accordion className={className}>
      {items.map((item, index) => (
        <AccordionItem key={index} title={item.question}>
          {item.answer}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
