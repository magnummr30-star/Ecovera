import React from "react";

/**
 * Wrapper for lazy-loaded sections (Reviews, RelatedProducts).
 * Parent controls content vs loading via children.
 */
export default function LazyContentSection({ children, refCallback }) {
  return (
    <div ref={refCallback} className="bg-[#FAFAFA] rounded-2xl shadow-xl p-6 min-h-[200px]">
      {children}
    </div>
  );
}
