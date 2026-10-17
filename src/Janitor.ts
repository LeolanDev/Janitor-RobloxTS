// ===== [ Types ] ===== //
/**
 * Represents any object that Janitor can address.
 */
type JanitableObject = 
    | Instance 
    | RBXScriptConnection 
    | object;

// ===== [ Classes ] ===== //
/**
 * Manages and tracks an object's memory in order to free up memory as soon as the object is deleted.
 */
export default class Janitor {
    /**
     * Create a new "Janitor" instance.
     * @param associatedClass Main class associated with deletion upon executing "cleanUp()".
     */
    constructor(associatedClass: object) { this.memoryStack.push(associatedClass); }
    /**
     * Adds a complete list of objects to the memory stack.
     * @param objList List of objects to add to the memory stack.
     */
    addObjectList(objList: JanitableObject[]): void {
        const { memoryStack } = this;
        objList.move(0, objList.size() - 1, memoryStack.size(), memoryStack);
    }
    /**
     * Adds an object to the Janitor's memory stack and returns that same object.
     * @param obj JanitableObject to push in memory stack.
     * @returns Object provided in the "obj" parameter.
     * 
     * @example
     * ```ts
     * class TestObj {
     *     constructor() {
     *          this.anotherClass = janitor.addObject(new AnotherClass()); // Add the object and assign it to the class.
     *     }
     *
     *     janitor: Janitor = new Janitor(this); 
     *     anotherClass!: AnotherClass;
     * }
     * ```
     */
    addObject<T extends JanitableObject>(obj: T): T { this.memoryStack.push(obj); return obj; }
    /**
     * Executes the destruction of all objects associated with Janitor, including itself.
     */
    cleanUp(): void {
        while (this.memoryStack.size() > 0) {
            const v = this.memoryStack.pop() as JanitableObject;

            if ("Destroy" in v) v.Destroy();
            else if (typeIs(v, "RBXScriptConnection")) v.Disconnect();
            else Janitor.destroyLuauTable(v);
        }

        Janitor.destroyLuauTable(this);
    }
    /**
     * Destroys any object considered a luau table.
     * @param obj Object to be destroyed.
     */
    static destroyLuauTable(obj: object): void {
        setmetatable(obj, undefined);
        table.clear(obj);
        table.freeze(obj);
    }

    /**
     * Stores all objects associated with Janitor to be destroyed later.
     */
    memoryStack: JanitableObject[] = [];
}