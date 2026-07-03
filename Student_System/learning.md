
   STUDENT MANAGEMENT SYSTEM
   Structure of this file (in order):
     1. Generic utilities   (debounce — reusable, not tied to students)
     2. StudentDB module    (all data + logic — knows NOTHING about HTML)
     3. UI wiring            (DOM code — knows NOTHING about internals of StudentDB)

   Why split like this: StudentDB works perfectly on its own in a plain
   Node console with zero HTML. That separation is what makes this easy
   to debug — if data logic is wrong, test StudentDB directly in console
   BEFORE ever touching the UI section.
  

Everything below is wrapped in an IIFE so `students` and `nextId`
   are PRIVATE — no outside code can directly touch them, only
   through the methods we explicitly expose.


   /* ------------------------------------------------------------
   3. UI WIRING
   Everything below only READS from the DOM and CALLS StudentDB
   methods. It never touches `students` or `nextId` directly —
   it can't, they're private. This boundary is what keeps the
   whole file debuggable: if output is wrong, the bug is either
   here (wrong data passed in) or inside StudentDB (wrong logic) —
   never both tangled together.
   ------------------------------------------------------------ */
