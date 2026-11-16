import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const app=resolve(import.meta.dirname,"../..");
const lesson=readFileSync(resolve(app,"curriculum/modules/module-10-lesson-3"),"utf8");
const source=resolve(app,"curriculum/source-materials/practice-worksheet-student-bundle/Int1_1003_practice.docx");
describe("Lesson 10-3 exact source",()=>{
 it("preserves all source groups, prompts, and subparts",()=>{expect(lesson).toContain("# Line Segments ⸱ Practice");for(const h of ["Examples 1 and 2","Example 3","Example 4","Example 5","Mixed Exercises"])expect(lesson).toContain(`## ${h}`);for(let n=1;n<=51;n++)expect(lesson).toContain(`### Problem ${n}\n`);expect(lesson).toContain("#### Part a");expect(lesson).toContain("#### Part b");expect(lesson).toContain("What assumptions did you make when solving this problem?");});
 it("preserves critical wording and response boundaries",()=>{for(const s of ["Find the value of the variable and YZ if Y is between X and Z.","Find the measure of each segment.","write a true statement","write and solve an equation to find AB","sometimes, always, or never true","Find the values of x and y","Use a ruler to find AC and AB"])expect(lesson).toContain(s);expect(lesson).not.toContain("Answer:");expect(lesson).not.toContain("x = 9.5");expect(lesson).not.toContain("x = 7\n");expect(lesson).toContain("PS is 5.8 millimeters. RS is 3.7 millimeters.");expect(lesson).toContain("HK is 12.2 feet. JK is 3.1 feet.");expect(lesson).not.toContain("PR is 5.8 millimeters");expect(lesson).not.toContain("HJ is 12.2 feet");});
 it("preserves segment symbols separately from numerical lengths", () => {
   expect(lesson).toContain(String.raw`$\overline{PQ} \cong \overline{RS}$, PQ = 9x – 7, and RS = 29`);
   expect(lesson).toContain(String.raw`For $\overline{AC}$, write and solve an equation to find AB.`);
   expect(lesson).toContain("Sketch line segment AC. Plot point B between A and C.");
 });
 it("preserves all twenty-three native image bytes",()=>{for(let n=1;n<=23;n++){const name=`image${n}.png`;const native=execFileSync("unzip",["-p",source,`word/media/${name}`]);const published=readFileSync(resolve(app,"public/curriculum/module-10-lesson-3",name));expect(published.equals(native)).toBe(true);expect(lesson).toContain(`/curriculum/module-10-lesson-3/${name}`);}});
});
