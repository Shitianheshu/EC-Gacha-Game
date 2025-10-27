interface CacheEntry<V> {
    value: V
    timestamp: number
}

export class CacheMap<K, V> {
    private readonly map = new Map<K, CacheEntry<V>>()

    private readonly cacheTime: number

    constructor(cacheTime: number) {
        this.cacheTime = cacheTime
    }

    /**
     * Returns a specified element from the CacheMap object.
     *
     * If the value associated with the provided key is an object,
     * then you will get a reference to that object,
     * and any change made to that object will effectively modify it inside the Map.
     *
     * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
     */
    public get(key: K): V | undefined {
        const entry = this.map.get(key)
        if (!entry) {
            return undefined
        }

        if (this.isInvalid(entry.timestamp)) {
            this.map.delete(key)
            return undefined
        }

        return entry.value
    }

    /**
     * Adds a new element with a specified key and value to the CacheMap. If an element with the same key already exists, the element will be updated.
     */
    public set(key: K, value: V) {
        this.map.set(key, { value, timestamp: Date.now() })
    }

    /**
     * @returns boolean indicating whether an element with the specified key exists or not.
     */
    public has(key: K): boolean {
        return this.map.has(key) && !this.isInvalid(this.map.get(key)!.timestamp)
    }

    /**
     * Removes the specified element from the CacheMap.
     * @returns true if the element was successfully removed, or false if it was not present.
     */
    public delete(key: K) {
        this.map.delete(key)
    }

    public clear() {
        this.map.clear()
    }

    private isInvalid(timestamp: number): boolean {
        return timestamp + this.cacheTime > Date.now()
    }
}
