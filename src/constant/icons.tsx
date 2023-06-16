export const UpVoteIcon = ({ stroke = '#666', fill = 'none', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    id="Capa_1"
    {...props}
    className="rounded"
  >
    <path d="M12 4 3 15h6v5h6v-5h6z" strokeWidth="1.5" stroke={stroke} fill={fill} strokeLinejoin="round"></path>
  </svg>
)

export const DownVoteIcon = ({ stroke = '#666', fill = 'none', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props} className="rounded">
    <path d="m12 20 9-11h-6V4H9v5H3z" stroke={stroke} fill={fill} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
