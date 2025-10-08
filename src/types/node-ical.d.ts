declare module 'node-ical' {
  export type ReturnObject = Record<string, any>;
  const ical: {
    async: {
      fromURL: (url: string) => Promise<ReturnObject>;
    };
  };
  export default ical;
}
