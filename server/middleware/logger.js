// V-TACS Emergency Dispatch & ASV Audit Logger Middleware

export function auditLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const isDispatch = req.path.includes('/dispatch/execute');
    const isTriage = req.path.includes('/triage/');

    if (isDispatch) {
      console.log(`[ASV AUDIT LOG] ${new Date().toISOString()} | DISPATCH EXECUTED | Path: ${req.path} | Status: ${res.statusCode} | Latency: ${duration}ms`);
    } else if (isTriage) {
      console.log(`[TRIAGE AUDIT LOG] ${new Date().toISOString()} | ROUTING CALCULATION | Path: ${req.path} | Status: ${res.statusCode} | Latency: ${duration}ms`);
    }
  });

  next();
}
