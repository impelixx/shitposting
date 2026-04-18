import { Comment } from "@/lib/types";

interface Props {
  comments: Comment[];
}

function initials(name: string) {
  return name.charAt(0).toUpperCase();
}

export function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return <p className="text-sm text-stone-400">Комментариев пока нет. Будьте первым!</p>;
  }
  return (
    <ul className="space-y-4">
      {comments.map((c) => (
        <li key={c.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials(c.author)}
          </div>
          <div className="flex-1 bg-stone-100 rounded-lg px-4 py-2.5">
            <p className="text-xs font-semibold text-stone-800 mb-1">{c.author}</p>
            <p className="text-sm text-stone-600 leading-relaxed">{c.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
