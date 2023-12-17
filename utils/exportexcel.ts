import { utils, writeFile } from "xlsx";

export const exportToXLSX = (data, fileName) => {
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Data");
  writeFile(workbook, `${fileName}.xlsx`);
};

//   const onExportClick = () => {
//     if (select.length === 0) return
//     const se = data?.questions.filter(q => select.includes(q.id)).map(q => {
//       return {
//         'Mata Pelajaran': q.subject,
//         // 'Kelas': q.grade,
//         'Soal': q.question,
//         'Jawaban': q.answer,
//         'Pilihan A': q.a,
//         'Pilihan B': q.b,
//         'Pilihan C': q.c,
//         'Pilihan D': q.d,
//         'Pilihan E': q.e,
//       }
//     })
//     exportToXLSX(se || [], `bikinsoal-${new Date().toISOString()}`)
