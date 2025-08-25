import jsPDF from "jspdf";


export interface Todo {
    id: number;
    title: string;
    description: string;
}


export function exportTodosAsPDF(username: string, todos: Todo[]) {
    const doc = new jsPDF();
    const now = new Date();
    doc.setFontSize(16);
    doc.text(`Todos for ${username}`, 10, 12);
    doc.setFontSize(10);
    doc.text(now.toLocaleString(), 10, 18);


    let y = 28;
    todos.forEach((todo, index) => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${todo.title}`, 10, y);
        y += 6;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(todo.description || "—", 180);
        doc.text(lines, 14, y);
        y += 8 + (Array.isArray(lines) ? lines.length * 5 : 0);
    });


    doc.save(`todos_${username}.pdf`);
}