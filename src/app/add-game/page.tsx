import AddGameForm from './add-game-form';

export default function AddGamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">新しいゲームを追加</h1>
          <p className="mt-2 text-muted-foreground">
            下のフォームを入力して、あなたのWebGLゲームをアーケードに追加しましょう。
          </p>
        </div>
        <AddGameForm />
      </div>
    </div>
  );
}
