// /pages/api/checkFile.js

import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  const { fileName } = req.query
  const filePath = path.join(process.cwd(), 'public', fileName)
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      return res.status(404).json({ success: false, message: 'File not found' })
    }
    return res.status(200).json({ success: true, message: 'File exists' })
  })
}
