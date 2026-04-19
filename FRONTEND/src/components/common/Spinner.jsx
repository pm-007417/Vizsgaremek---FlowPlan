export function Spinner() {
    return (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Betöltés...</span>
            </div>
        </div>
    );
}