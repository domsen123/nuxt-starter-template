type SortOrder = [string, number] // Definiert ein Tupel aus Schlüsselname und Sortierrichtung

export const multiSort = <T>(array: T[], sortOrders: SortOrder[]): T[] => {
  return array.sort((a: T, b: T): number => {
    for (const [key, order] of sortOrders) {
      // TypeScript erkennt den Schlüssel nicht automatisch als gültigen Schlüssel von T,
      // daher verwenden wir hier den Index-Zugriff und Type Assertion
      const valA = typeof a[key as keyof T] === 'string' ? (a[key as keyof T] as string).toLowerCase() : a[key as keyof T]
      const valB = typeof b[key as keyof T] === 'string' ? (b[key as keyof T] as string).toLowerCase() : b[key as keyof T]

      if (valA < valB)
        return -1 * order

      if (valA > valB)
        return 1 * order
    }
    return 0 // Sind alle Vergleichswerte gleich, bleibt die Reihenfolge unverändert
  })
}
