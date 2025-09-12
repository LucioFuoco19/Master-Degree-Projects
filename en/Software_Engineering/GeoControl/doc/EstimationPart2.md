# Project Estimation part 2

Goal of this document is to compare actual effort and size of the project, vs the estimates made in task1.

## Computation of size

To compute the lines of code use cloc  
To install cloc:  
 npm install -g cloc  
On Windows, also a perl interpreter needs to be installed. You find it here https://strawberryperl.com/  
To run cloc  
 cloc <directory containing ts files> --include-lang=TypeScript  
As a result of cloc collect the _code_ value (rightmost column of the result table)

Compute two separate values of size  
-LOC of production code cloc <Geocontrol\src> --include-lang=TypeScript  
-LOC of test code cloc <GeoControl\test> --include-lang=TypeScript

## Computation of effort

From timesheet.md sum all effort spent, in ALL activities (task1, task2, task3) at the end of the project on June 7. Exclude task4

## Computation of productivity

productivity = ((LOC of production code)+ (LOC of test code)) / effort

## Comparison

|                      | Estimated (end of task 1) | Actual (june 7, end of task 3) |
| -------------------- | ------------------------- | ------------------------------ |
| production code size | 2000                      | 2356                           |
| test code size       | 644 (unit + api tests)    | 7277                           |
| total size           | 2644                      | 9633                           |
| effort               | 1984                      | 264                            |
| productivity         | 10 loc / hour             | 36.5 loc /hour                 |

The total effort of 264 person-hours refers to the sum of the working time of all 4 team members, as required by the definition of person-hour.

Report, as estimate of effort, the value obtained via activity decomposition technique.

The total effort of 264 person-hours refers to the sum of the working time of all 4 team members, as required by the definition of person-hour.

The estimated effort via activity decomposition technique was 1984 person-hours, as computed during Task 1.
This value turned out to be a significant overestimation, mainly because — at the time — we did not yet have a full understanding of the actual scope, complexity, and implementation strategies of the project. Each activity was estimated conservatively to ensure margin and coverage, which naturally led to a high cumulative total.

Although the three estimation approaches yielded significantly different results, the actual effort spent (264 person-hours) was substantially lower than the estimates produced by product decomposition (1950h) and activity decomposition (1984h).

Several factors help explain this gap:

Initial uncertainty and overestimation: The activity-based estimates were made early in the process, without yet having clarity on the system’s real requirements, reuse opportunities, or simplification strategies.

Code reuse and consistency: Architectural patterns and testing logic were reused across modules, reducing development time and avoiding duplication.

High team efficiency: The team worked with strong coordination and clear division of responsibilities, which boosted productivity and limited rework.

Progressive scope refinement: As the project evolved, some initially expected complexities (e.g., advanced containerization or dynamic UI behaviors) were simplified or deprioritized.

Interestingly, the size-based estimate (200h) turned out to be quite close to the actual effort, highlighting its potential effectiveness when the development scope and pace can be reasonably anticipated.
