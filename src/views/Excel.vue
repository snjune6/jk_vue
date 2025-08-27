<script setup>
import { ref, onMounted, computed, watchEffect, nextTick } from 'vue'

const API_BASE = 'http://localhost:5174'

const loading = ref(false)
const error = ref('')
const items = ref([])
// pagination state
const page = ref(1)
const pageSizeInput = ref('5')
const pageSize = computed(() => {
  const n = Number(pageSizeInput.value)
  const v = Number.isFinite(n) && n > 0 ? Math.floor(n) : 5
  return Math.max(1, v)
})
const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize.value)))
const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return items.value.slice(start, start + pageSize.value)
})
function gotoPage(p) {
  const tp = totalPages.value
  if (p < 1) p = 1
  if (p > tp) p = tp
  page.value = p
}
watchEffect(() => {
  // clamp page whenever totalPages changes (items or pageSize changed)
  if (page.value > totalPages.value) page.value = totalPages.value
  if (page.value < 1) page.value = 1
})

// page jump (click current page to edit and navigate on input)
const pageJump = ref({ editing: false, value: '1' })
const pageJumpInputEl = ref(null)
function startPageJump() {
  pageJump.value = { editing: true, value: String(page.value) }
  nextTick(() => {
    if (pageJumpInputEl.value) {
      pageJumpInputEl.value.focus()
      pageJumpInputEl.value.select()
    }
  })
}
function cancelPageJump() {
  pageJump.value.editing = false
}
function onPageJumpInput() {
  const n = Math.floor(Number(pageJump.value.value))
  if (Number.isFinite(n)) {
    gotoPage(n)
  }
}

const form = ref({ name: '', stock: '', etc: '' })

// inline edit state
const editing = ref({ id: null, field: null, value: '', saving: false })

function startEdit(row, field) {
  editing.value = { id: row.id, field, value: String(row[field] ?? ''), saving: false }
}
function cancelEdit() {
  editing.value = { id: null, field: null, value: '', saving: false }
}
async function saveEdit(row) {
  if (!editing.value.id || !editing.value.field) return
  error.value = ''
  const field = editing.value.field
  let payload = {}
  if (field === 'name') {
    const v = editing.value.value.trim()
    if (!v) { error.value = '제품명은 비워둘 수 없어요.'; return }
    payload = { name: v }
  } else if (field === 'stock') {
    const n = Number(editing.value.value)
    if (!Number.isFinite(n) || n < 0) { error.value = '재고량은 0 이상의 숫자여야 해요.'; return }
    payload = { stock: n }
  } else if (field === 'etc') {
    payload = { etc: String(editing.value.value) }
  } else {
    return
  }
  try {
    editing.value.saving = true
    const res = await fetch(`${API_BASE}/inventory/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`Update failed: ${res.status}`)
    const updated = await res.json()
    // update local items without full refetch for snappy UX
    const idx = items.value.findIndex(i => i.id === row.id)
    if (idx !== -1) items.value[idx] = updated
    cancelEdit()
  } catch (e) {
    error.value = String(e)
  } finally {
    editing.value.saving = false
  }
}

async function fetchItems() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/inventory`)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
    items.value = await res.json()
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

async function addItem() {
  error.value = ''
  if (!form.value.name.trim()) {
    error.value = '제품명을 입력하세요.'
    return
  }
  const stockNum = Number(form.value.stock)
  if (!Number.isFinite(stockNum) || stockNum < 0) {
    error.value = '재고량은 0 이상의 숫자여야 해요.'
    return
  }
  try {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.value.name.trim(), stock: stockNum, etc: form.value.etc.trim() })
    })
    if (!res.ok) throw new Error(`Save failed: ${res.status}`)
    form.value = { name: '', stock: '', etc: '' }
    await fetchItems()
  } catch (e) {
    error.value = String(e)
  }
}

onMounted(fetchItems)

async function confirmDelete(row) {
  const ok = window.confirm(`'${row.name}' 를 삭제할까요?`)
  if (!ok) return
  try {
    const res = await fetch(`${API_BASE}/inventory/${row.id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`)
    // Remove from local list and adjust pagination if needed
    items.value = items.value.filter(i => i.id !== row.id)
    // if current page becomes empty and not the first page, go to previous page
    const start = (page.value - 1) * pageSize.value
    if (page.value > 1 && items.value.slice(start, start + pageSize.value).length === 0) {
      page.value = page.value - 1
    }
  } catch (e) {
    error.value = String(e)
  }
}

// Stock increment/decrement support
const stockSaving = ref(new Set())
async function changeStock(row, delta) {
  try {
    error.value = ''
    const current = Number(row.stock)
    const next = Math.max(0, current + Number(delta || 0))
    if (!Number.isFinite(next)) return
    if (next === current) return
    stockSaving.value.add(row.id)
    const res = await fetch(`${API_BASE}/inventory/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: next })
    })
    if (!res.ok) throw new Error(`Update failed: ${res.status}`)
    const updated = await res.json()
    const idx = items.value.findIndex(i => i.id === row.id)
    if (idx !== -1) items.value[idx] = updated
  } catch (e) {
    error.value = String(e)
  } finally {
    stockSaving.value.delete(row.id)
  }
}
</script>

<template>
  <section>
    <h1>창고 관리 시스템 (Excel)</h1>

    <div class="topbar">
      <div class="input-row">
        <input v-model="form.name" placeholder="제품명" />
        <input v-model="form.stock" placeholder="재고량" type="number" min="0" />
        <input v-model="form.etc" placeholder="기타" />
        <button @click="addItem">바로 입력/저장</button>
      </div>
      <div class="paging-controls top">
        <label>
          페이지당 개수
          <input class="page-size" v-model="pageSizeInput" type="number" min="1" step="1" />
        </label>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="name">제품명</th>
            <th style="width: 80px">재고량</th>
            <th class="etc">기타</th>
            <th style="width: 72px">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4">불러오는 중...</td>
          </tr>
          <tr v-for="(row, idx) in pagedItems" :key="row.id">
            <td class="name">
              <template v-if="editing.id === row.id && editing.field === 'name'">
                <div class="cell-edit">
                  <input v-model="editing.value" @keyup.enter="saveEdit(row)" @keyup.esc="cancelEdit" autofocus />
                  <button class="icon save" :disabled="editing.saving" @click="saveEdit(row)">✔</button>
                  <button class="icon cancel" :disabled="editing.saving" @click="cancelEdit">✖</button>
                </div>
              </template>
              <template v-else>
                <template v-if="row.name && row.name.trim() !== ''">
                  <span class="cell-display" @dblclick="startEdit(row, 'name')" :title="row.name">{{ row.name }}</span>
                </template>
                <template v-else>
                  <button class="icon empty" title="입력" @click="startEdit(row, 'name')">✎</button>
                </template>
              </template>
            </td>
            <td class="num">
              <template v-if="editing.id === row.id && editing.field === 'stock'">
                <div class="cell-edit">
                  <input type="number" min="0" v-model="editing.value" @keyup.enter="saveEdit(row)" @keyup.esc="cancelEdit" autofocus />
                  <button class="icon save" :disabled="editing.saving" @click="saveEdit(row)">✔</button>
                  <button class="icon cancel" :disabled="editing.saving" @click="cancelEdit">✖</button>
                </div>
              </template>
              <template v-else>
                <div class="stock-cell">
                  <button class="icon stock-btn down" :disabled="stockSaving.has(row.id) || row.stock <= 0" title="1 감소" @click="changeStock(row, -1)">▼</button>
                  <span class="cell-display stock-num">{{ row.stock ?? '' }}</span>
                  <button class="icon stock-btn up" :disabled="stockSaving.has(row.id)" title="1 증가" @click="changeStock(row, 1)">▲</button>
                </div>
              </template>
            </td>
            <td class="etc">
              <template v-if="editing.id === row.id && editing.field === 'etc'">
                <div class="cell-edit">
                  <input v-model="editing.value" @keyup.enter="saveEdit(row)" @keyup.esc="cancelEdit" autofocus />
                  <button class="icon save" :disabled="editing.saving" @click="saveEdit(row)">✔</button>
                  <button class="icon cancel" :disabled="editing.saving" @click="cancelEdit">✖</button>
                </div>
              </template>
              <template v-else>
                <template v-if="row.etc !== null && row.etc !== undefined && String(row.etc).trim() !== ''">
                  <span class="cell-display" @dblclick="startEdit(row, 'etc')" title="더블클릭해서 편집">{{ row.etc }}</span>
                </template>
                <template v-else>
                  <button class="icon empty" title="입력" @click="startEdit(row, 'etc')">✎</button>
                </template>
              </template>
            </td>
            <td>
              <button class="icon delete" title="삭제" @click="confirmDelete(row)">🗑</button>
            </td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="4">데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="paging-controls bottom">
      <div class="pager">
        <button @click="gotoPage(1)" :disabled="page === 1">⏮</button>
        <button @click="gotoPage(page - 1)" :disabled="page === 1">◀</button>
        <span v-if="!pageJump.editing" class="page-indicator" title="클릭해서 페이지 이동" @click="startPageJump">{{ page }} / {{ totalPages }}</span>
        <span v-else class="page-jump">
          <input ref="pageJumpInputEl" class="page-jump-input" type="number" min="1" :max="totalPages" v-model="pageJump.value" @input="onPageJumpInput" @keyup.esc="cancelPageJump" @blur="cancelPageJump" />
        </span>
        <button @click="gotoPage(page + 1)" :disabled="page === totalPages">▶</button>
        <button @click="gotoPage(totalPages)" :disabled="page === totalPages">⏭</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 테이블을 엑셀에 복사/붙여넣기 했을 때 셀 경계가 분명히 보이도록 전체 보더 지정 */
.topbar { display: flex; flex-wrap: wrap; gap: 0.75rem 1rem; align-items: flex-end; justify-content: space-between; margin-bottom: 0.5rem; }
.input-row { display: flex; gap: 0.5rem; margin: 0.5rem 0 0.5rem; flex-wrap: wrap; align-items: stretch; }
.input-row input { flex: 1 1 160px; padding: 0.5rem 0.6rem; border: 1px solid #ddd; border-radius: 6px; min-width: 140px; max-width: 100%; box-sizing: border-box; }
.input-row button { flex: 1 1 100%; width: 100%; display: block; padding: 0.5rem 0.75rem; border: 1px solid #0aa; background: #0bb; color: white; border-radius: 6px; }
.error { color: #c00; margin: 0.5rem 0; }
.table-wrap { overflow: auto; border: 2px solid #ddd; border-radius: 8px; }
/* border-collapse를 유지해 이중 보더를 방지하고, 각 셀에 1px 보더 적용 */
table { width: 100%; border-collapse: collapse; table-layout: auto; }
th, td { border: 1px solid #d0d0d0; padding: 0.5rem 0.75rem; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Allow 제품명 and 기타 to grow/wrap */
td.name, th.name, td.etc, th.etc { white-space: normal; text-overflow: clip; }
/* Alignments per issue */
td.name { text-align: left; }
td.etc { text-align: left; }
/* Narrow numeric and manage columns */
th[style*="width: 80px"], td.num { width: 80px; }
th[style*="width: 72px"] { width: 72px; }
/* 헤더는 어두운 배경, 밝은 글자색으로 가독성 향상 */
thead th { background: #2f3542; color: #fff; border-bottom: 2px solid #cfcfcf; }
.num { text-align: center; }
.icon { display: none; }
.icon.save { display: inline-block; border-color: #0a7; background: #0c8; color: #fff; }
.icon.cancel { display: inline-block; border-color: #a55; background: #c66; color: #fff; }
.icon.empty { display: inline-block; padding: 2px 6px; border: 1px dashed #bbb; background: #fafafa; color: #666; border-radius: 4px; cursor: pointer; font-size: 12px; }
.icon.delete { display: inline-block; padding: 2px 6px; border: 1px solid #e0b4b4; background: #ffe9e9; color: #c00; border-radius: 4px; cursor: pointer; font-size: 12px; }
/* Stock inline control */
.stock-cell { display: inline-flex; align-items: center; gap: 4px; }
.icon.stock-btn { display: inline-flex; align-items: center; justify-content: center; }
.stock-btn { padding: 0 4px; border: 1px solid #bbb; background: #f8f8f8; color: #333; border-radius: 4px; cursor: pointer; font-size: 11px; line-height: 1.2; }
.stock-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.stock-num { min-width: 1.5em; display: inline-block; text-align: center; }
 .cell-edit { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; }
 .cell-edit input { padding: 2px 6px; border: 1px solid #ccc; border-radius: 4px; min-width: 80px; max-width: 100%; box-sizing: border-box; }
 .cell-display { cursor: pointer; display: inline-block; max-width: 100%; }
 .cell-display:hover { text-decoration: underline dotted; }
 .paging-controls { display: flex; gap: 0.75rem; align-items: center; justify-content: flex-end; margin-top: 0.5rem; }
 .paging-controls.top { justify-content: flex-end; }
 .paging-controls.bottom { justify-content: center; }
 .paging-controls label { font-size: 0.9rem; color: #fff; display: inline-flex; align-items: center; gap: 6px; }
 .page-size { width: 80px; padding: 0.3rem 0.4rem; border: 1px solid #ccc; border-radius: 6px; }
 .pager { display: inline-flex; gap: 4px; align-items: center; }
 .pager button { padding: 4px 8px; border: 1px solid #bbb; background: #f5f5f5; color: #333; border-radius: 4px; }
 .pager span { min-width: 64px; text-align: center; display: inline-block; }
 .page-indicator { cursor: pointer; user-select: none; padding: 2px 6px; border-radius: 4px; }
 .page-indicator:hover { background: #eef6ff; }
 .page-jump-input { width: 70px; padding: 2px 6px; border: 1px solid #bbb; border-radius: 4px; }
</style>