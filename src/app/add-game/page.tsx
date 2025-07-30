import AddGameForm from './add-game-form';

export default function AddGamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Add a New Game</h1>
          <p className="mt-2 text-muted-foreground">
            Fill out the form below to add your WebGL game to the arcade.
          </p>
        </div>
        <AddGameForm />
      </div>
    </div>
  );
}
