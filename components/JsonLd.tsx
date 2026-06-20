// Renders a JSON-LD <script> into the document. Server-safe (no client JS).
// `data` is serialised once; we rely on Next.js to place it in the streamed
// HTML so crawlers see it without executing JavaScript.

export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org payload is build-time/server data, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
